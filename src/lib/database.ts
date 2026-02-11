import * as SQLite from 'expo-sqlite';

const DB_NAME = 'operavoce.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      avatar_url TEXT,
      voice_type TEXT CHECK (voice_type IN ('soprano','mezzo_soprano','contralto','tenor','baritone','bass')),
      experience_level TEXT CHECK (experience_level IN ('beginner','intermediate','advanced')),
      practice_days_per_week INTEGER DEFAULT 3,
      preferred_practice_time TEXT DEFAULT '18:00',
      timezone TEXT DEFAULT 'UTC',
      streak_current INTEGER DEFAULT 0,
      streak_longest INTEGER DEFAULT 0,
      total_practice_minutes INTEGER DEFAULT 0,
      subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','premium','lifetime')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      level TEXT CHECK (level IN ('beginner','intermediate','advanced')),
      duration_weeks INTEGER,
      thumbnail_url TEXT,
      is_free INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT CHECK (type IN ('text','exercise','audio','quiz','video')),
      content TEXT NOT NULL DEFAULT '{}',
      audio_url TEXT,
      video_url TEXT,
      duration_estimate_min INTEGER,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_programs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
      start_date TEXT DEFAULT (date('now')),
      target_end_date TEXT,
      current_module_id TEXT,
      current_lesson_id TEXT,
      percent_complete REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, program_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_completions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
      completed_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT,
      status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','skipped')),
      user_program_id TEXT REFERENCES user_programs(id) ON DELETE SET NULL,
      linked_lesson_ids TEXT DEFAULT '[]',
      actual_duration_min INTEGER,
      self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
      journal_note TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session_goals (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
      type TEXT CHECK (type IN ('duration','exercise','custom')),
      description TEXT,
      target_value TEXT,
      actual_value TEXT,
      met INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      daily_reminder_enabled INTEGER DEFAULT 1,
      daily_reminder_offset_min INTEGER DEFAULT 30,
      streak_reminder_enabled INTEGER DEFAULT 1,
      streak_reminder_time TEXT DEFAULT '20:00',
      weekly_summary_enabled INTEGER DEFAULT 1,
      weekly_summary_day INTEGER DEFAULT 0,
      weekly_summary_time TEXT DEFAULT '10:00',
      milestone_notifications INTEGER DEFAULT 1,
      expo_push_token TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('insert','update','delete')),
      data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0
    );
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM sync_queue;
    DELETE FROM session_goals;
    DELETE FROM sessions;
    DELETE FROM lesson_completions;
    DELETE FROM user_programs;
    DELETE FROM lessons;
    DELETE FROM modules;
    DELETE FROM programs;
    DELETE FROM notification_preferences;
    DELETE FROM profiles;
  `);
}
