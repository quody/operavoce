import { getDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function mergeLocalToCloud(): Promise<void> {
  const localUserId = await AsyncStorage.getItem('local_user_id');
  if (!localUserId) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const cloudUserId = session.user.id;
  const db = await getDatabase();

  // 1. Merge profile
  const localProfile = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM profiles WHERE id = ?',
    [localUserId]
  );

  if (localProfile) {
    const { id: _id, created_at: _ca, ...profileData } = localProfile;
    await supabase.from('profiles').upsert({
      id: cloudUserId,
      ...profileData,
      display_name: session.user.user_metadata?.full_name ?? profileData.display_name,
      avatar_url: session.user.user_metadata?.avatar_url ?? profileData.avatar_url,
    });
  }

  // 2. Merge user_programs
  const userPrograms = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM user_programs WHERE user_id = ?',
    [localUserId]
  );

  for (const up of userPrograms) {
    const { user_id: _uid, ...data } = up;
    await supabase.from('user_programs').upsert({ ...data, user_id: cloudUserId });
  }

  // 3. Merge sessions
  const sessions = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM sessions WHERE user_id = ?',
    [localUserId]
  );

  for (const session_item of sessions) {
    const { user_id: _uid, ...data } = session_item;
    await supabase.from('sessions').upsert({ ...data, user_id: cloudUserId });
  }

  // 4. Merge session_goals
  for (const session_item of sessions) {
    const goals = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM session_goals WHERE session_id = ?',
      [session_item.id as string]
    );
    for (const goal of goals) {
      await supabase.from('session_goals').upsert(goal);
    }
  }

  // 5. Merge lesson_completions
  const completions = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM lesson_completions WHERE user_id = ?',
    [localUserId]
  );

  for (const comp of completions) {
    const { user_id: _uid, ...data } = comp;
    await supabase.from('lesson_completions').upsert({ ...data, user_id: cloudUserId });
  }

  // 6. Merge notification_preferences
  const notifPrefs = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM notification_preferences WHERE user_id = ?',
    [localUserId]
  );

  if (notifPrefs) {
    const { user_id: _uid, ...data } = notifPrefs;
    await supabase.from('notification_preferences').upsert({ ...data, user_id: cloudUserId });
  }

  // 7. Update local database to use cloud user ID
  await db.execAsync(`
    UPDATE profiles SET id = '${cloudUserId}' WHERE id = '${localUserId}';
    UPDATE user_programs SET user_id = '${cloudUserId}' WHERE user_id = '${localUserId}';
    UPDATE sessions SET user_id = '${cloudUserId}' WHERE user_id = '${localUserId}';
    UPDATE lesson_completions SET user_id = '${cloudUserId}' WHERE user_id = '${localUserId}';
    UPDATE notification_preferences SET user_id = '${cloudUserId}' WHERE user_id = '${localUserId}';
  `);

  // 8. Update AsyncStorage
  await AsyncStorage.multiSet([
    ['auth_mode', 'authenticated'],
    ['local_user_id', cloudUserId],
  ]);
}
