import { getDatabase } from '@/lib/database';
import { Session, SessionGoal } from '@/types/database';
import { SessionWithDetails } from '@/types/domain';
import { generateId } from '@/utils/uuid';
import { getCurrentUserId } from './authService';

export async function getSessions(startDate: string, endDate: string): Promise<Session[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const db = await getDatabase();
  const rows = await db.getAllAsync<Session & { linked_lesson_ids: string }>(
    `SELECT * FROM sessions 
     WHERE user_id = ? AND scheduled_date >= ? AND scheduled_date <= ?
     ORDER BY scheduled_date, scheduled_time`,
    [userId, startDate, endDate]
  );

  return rows.map((r) => ({
    ...r,
    linked_lesson_ids: typeof r.linked_lesson_ids === 'string'
      ? JSON.parse(r.linked_lesson_ids)
      : r.linked_lesson_ids,
  }));
}

export async function getSessionWithDetails(sessionId: string): Promise<SessionWithDetails | null> {
  const db = await getDatabase();
  const session = await db.getFirstAsync<Session & { linked_lesson_ids: string }>(
    'SELECT * FROM sessions WHERE id = ?',
    [sessionId]
  );
  if (!session) return null;

  const lessonIds: string[] = typeof session.linked_lesson_ids === 'string'
    ? JSON.parse(session.linked_lesson_ids)
    : session.linked_lesson_ids;

  const goals = await db.getAllAsync<SessionGoal>(
    'SELECT * FROM session_goals WHERE session_id = ?',
    [sessionId]
  );

  let lessons: any[] = [];
  if (lessonIds.length > 0) {
    const placeholders = lessonIds.map(() => '?').join(',');
    lessons = await db.getAllAsync(
      `SELECT * FROM lessons WHERE id IN (${placeholders}) ORDER BY sort_order`,
      lessonIds
    );
    lessons = lessons.map((l: any) => ({
      ...l,
      content: typeof l.content === 'string' ? JSON.parse(l.content) : l.content,
    }));
  }

  let programTitle: string | undefined;
  if (session.user_program_id) {
    const up = await db.getFirstAsync<{ title: string }>(
      `SELECT p.title FROM user_programs up JOIN programs p ON up.program_id = p.id WHERE up.id = ?`,
      [session.user_program_id]
    );
    programTitle = up?.title;
  }

  return {
    ...session,
    linked_lesson_ids: lessonIds,
    goals: goals.map((g) => ({ ...g, met: Boolean(g.met) })),
    lessons,
    program_title: programTitle,
  };
}

export async function createSession(params: {
  scheduled_date: string;
  scheduled_time?: string;
  user_program_id?: string;
  linked_lesson_ids?: string[];
}): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No user session');

  const id = generateId();
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sessions (id, user_id, scheduled_date, scheduled_time, user_program_id, linked_lesson_ids)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, params.scheduled_date, params.scheduled_time ?? null,
     params.user_program_id ?? null,
     JSON.stringify(params.linked_lesson_ids ?? [])]
  );

  return id;
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.actual_duration_min !== undefined) { fields.push('actual_duration_min = ?'); values.push(updates.actual_duration_min); }
  if (updates.self_rating !== undefined) { fields.push('self_rating = ?'); values.push(updates.self_rating); }
  if (updates.journal_note !== undefined) { fields.push('journal_note = ?'); values.push(updates.journal_note); }
  if (updates.completed_at !== undefined) { fields.push('completed_at = ?'); values.push(updates.completed_at); }
  if (updates.scheduled_date !== undefined) { fields.push('scheduled_date = ?'); values.push(updates.scheduled_date); }
  if (updates.scheduled_time !== undefined) { fields.push('scheduled_time = ?'); values.push(updates.scheduled_time); }

  if (fields.length === 0) return;
  values.push(sessionId);

  await db.runAsync(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function completeSession(sessionId: string, rating: number, note?: string, durationMin?: number): Promise<void> {
  await updateSession(sessionId, {
    status: 'completed',
    self_rating: rating,
    journal_note: note ?? null,
    actual_duration_min: durationMin ?? null,
    completed_at: new Date().toISOString(),
  });
}

export async function skipSession(sessionId: string): Promise<void> {
  await updateSession(sessionId, { status: 'skipped' });
}

export async function addSessionGoal(sessionId: string, goal: { type: string; description: string; target_value?: string }): Promise<string> {
  const id = generateId();
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO session_goals (id, session_id, type, description, target_value) VALUES (?, ?, ?, ?, ?)`,
    [id, sessionId, goal.type, goal.description, goal.target_value ?? null]
  );
  return id;
}

export async function updateGoal(goalId: string, updates: { actual_value?: string; met?: boolean }): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.actual_value !== undefined) { fields.push('actual_value = ?'); values.push(updates.actual_value); }
  if (updates.met !== undefined) { fields.push('met = ?'); values.push(updates.met ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(goalId);

  await db.runAsync(`UPDATE session_goals SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function getTodaySession(): Promise<Session | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const today = new Date().toISOString().split('T')[0];
  const db = await getDatabase();
  const session = await db.getFirstAsync<Session & { linked_lesson_ids: string }>(
    `SELECT * FROM sessions WHERE user_id = ? AND scheduled_date = ? AND status = 'upcoming' ORDER BY scheduled_time LIMIT 1`,
    [userId, today]
  );

  if (!session) return null;
  return {
    ...session,
    linked_lesson_ids: typeof session.linked_lesson_ids === 'string'
      ? JSON.parse(session.linked_lesson_ids)
      : session.linked_lesson_ids,
  };
}

export async function getCompletedSessionDates(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const db = await getDatabase();
  const rows = await db.getAllAsync<{ scheduled_date: string }>(
    `SELECT DISTINCT scheduled_date FROM sessions WHERE user_id = ? AND status = 'completed' ORDER BY scheduled_date`,
    [userId]
  );
  return rows.map((r) => r.scheduled_date);
}

export async function getSessionStats(): Promise<{ total_sessions: number; total_minutes: number; avg_rating: number; goal_hit_rate: number }> {
  const userId = await getCurrentUserId();
  if (!userId) return { total_sessions: 0, total_minutes: 0, avg_rating: 0, goal_hit_rate: 0 };

  const db = await getDatabase();
  const stats = await db.getFirstAsync<{ total_sessions: number; total_minutes: number; avg_rating: number }>(
    `SELECT 
      COUNT(*) as total_sessions,
      COALESCE(SUM(actual_duration_min), 0) as total_minutes,
      COALESCE(AVG(self_rating), 0) as avg_rating
     FROM sessions WHERE user_id = ? AND status = 'completed'`,
    [userId]
  );

  const goalStats = await db.getFirstAsync<{ total_goals: number; met_goals: number }>(
    `SELECT 
      COUNT(*) as total_goals,
      SUM(CASE WHEN met = 1 THEN 1 ELSE 0 END) as met_goals
     FROM session_goals sg
     JOIN sessions s ON sg.session_id = s.id
     WHERE s.user_id = ? AND s.status = 'completed'`,
    [userId]
  );

  return {
    total_sessions: stats?.total_sessions ?? 0,
    total_minutes: stats?.total_minutes ?? 0,
    avg_rating: stats?.avg_rating ?? 0,
    goal_hit_rate: goalStats && goalStats.total_goals > 0
      ? (goalStats.met_goals / goalStats.total_goals) * 100
      : 0,
  };
}
