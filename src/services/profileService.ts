import { getDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { getAuthMode, getCurrentUserId } from './authService';

export async function getProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const db = await getDatabase();
  const profile = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  return profile ?? null;
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const allowedFields: (keyof Profile)[] = [
    'display_name', 'avatar_url', 'voice_type', 'experience_level',
    'practice_days_per_week', 'preferred_practice_time', 'timezone',
    'streak_current', 'streak_longest', 'total_practice_minutes',
    'subscription_tier',
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = ?`);
      values.push(updates[field] as string | number | null);
    }
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(userId);

  await db.runAsync(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, values);

  // Sync to Supabase if authenticated
  const mode = await getAuthMode();
  if (mode === 'authenticated') {
    await supabase.from('profiles').update(updates).eq('id', userId);
  }
}

export async function enrollInProgram(programId: string): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No user session');

  const db = await getDatabase();
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();

  const program = await db.getFirstAsync<{ duration_weeks: number }>(
    'SELECT duration_weeks FROM programs WHERE id = ?',
    [programId]
  );

  const startDate = new Date().toISOString().split('T')[0];
  let targetEndDate: string | null = null;
  if (program?.duration_weeks) {
    const end = new Date();
    end.setDate(end.getDate() + program.duration_weeks * 7);
    targetEndDate = end.toISOString().split('T')[0];
  }

  const firstModule = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM modules WHERE program_id = ? ORDER BY sort_order LIMIT 1',
    [programId]
  );

  let firstLesson: { id: string } | null = null;
  if (firstModule) {
    firstLesson = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM lessons WHERE module_id = ? ORDER BY sort_order LIMIT 1',
      [firstModule.id]
    );
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO user_programs (id, user_id, program_id, start_date, target_end_date, current_module_id, current_lesson_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, programId, startDate, targetEndDate, firstModule?.id ?? null, firstLesson?.id ?? null]
  );

  return id;
}

export async function getUserPrograms(): Promise<any[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT up.*, p.title, p.description, p.level, p.duration_weeks, p.thumbnail_url
     FROM user_programs up
     JOIN programs p ON up.program_id = p.id
     WHERE up.user_id = ?
     ORDER BY up.updated_at DESC`,
    [userId]
  );
}

export async function updateProgramProgress(userProgramId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const db = await getDatabase();
  const up = await db.getFirstAsync<{ program_id: string }>(
    'SELECT program_id FROM user_programs WHERE id = ?',
    [userProgramId]
  );
  if (!up) return;

  const totalLessons = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM lessons l
     JOIN modules m ON l.module_id = m.id
     WHERE m.program_id = ?`,
    [up.program_id]
  );

  const completedLessons = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM lesson_completions lc
     JOIN lessons l ON lc.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     WHERE m.program_id = ? AND lc.user_id = ?`,
    [up.program_id, userId]
  );

  const total = totalLessons?.count ?? 0;
  const completed = completedLessons?.count ?? 0;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const status = percent >= 100 ? 'completed' : 'active';

  await db.runAsync(
    `UPDATE user_programs SET percent_complete = ?, status = ?, updated_at = datetime('now') WHERE id = ?`,
    [percent, status, userProgramId]
  );
}
