import { getDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { getAuthMode } from './authService';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueueItem {
  id: number;
  table_name: string;
  record_id: string;
  operation: 'insert' | 'update' | 'delete';
  data: string | null;
  created_at: string;
}

export async function addToSyncQueue(
  tableName: string,
  recordId: string,
  operation: 'insert' | 'update' | 'delete',
  data?: Record<string, unknown>
): Promise<void> {
  const mode = await getAuthMode();
  if (mode !== 'authenticated') return;

  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sync_queue (table_name, record_id, operation, data) VALUES (?, ?, ?, ?)`,
    [tableName, recordId, operation, data ? JSON.stringify(data) : null]
  );
}

export async function processSyncQueue(): Promise<void> {
  const mode = await getAuthMode();
  if (mode !== 'authenticated') return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const db = await getDatabase();
  const items = await db.getAllAsync<SyncQueueItem>(
    'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC LIMIT 50'
  );

  for (const item of items) {
    try {
      const data = item.data ? JSON.parse(item.data) : null;

      switch (item.operation) {
        case 'insert':
          if (data) {
            await supabase.from(item.table_name).upsert(data);
          }
          break;
        case 'update':
          if (data) {
            await supabase.from(item.table_name).update(data).eq('id', item.record_id);
          }
          break;
        case 'delete':
          await supabase.from(item.table_name).delete().eq('id', item.record_id);
          break;
      }

      await db.runAsync('UPDATE sync_queue SET synced = 1 WHERE id = ?', [item.id]);
    } catch (error) {
      console.warn(`Sync failed for item ${item.id}:`, error);
    }
  }

  // Clean up synced items older than 24 hours
  await db.runAsync(
    `DELETE FROM sync_queue WHERE synced = 1 AND created_at < datetime('now', '-1 day')`
  );
}

export function startSyncListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processSyncQueue().catch(console.warn);
    }
  });

  // Also run sync periodically
  const interval = setInterval(() => {
    processSyncQueue().catch(console.warn);
  }, 60000); // Every 60 seconds

  return () => {
    unsubscribe();
    clearInterval(interval);
  };
}
