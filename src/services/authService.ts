import { supabase } from '@/lib/supabase';
import { getDatabase } from '@/lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/uuid';
import { Profile } from '@/types/database';

export async function getAuthMode(): Promise<'authenticated' | 'guest' | 'none'> {
  const mode = await AsyncStorage.getItem('auth_mode');
  if (mode === 'guest') return 'guest';
  if (mode === 'authenticated') return 'authenticated';
  return 'none';
}

export async function getLocalUserId(): Promise<string | null> {
  return AsyncStorage.getItem('local_user_id');
}

export async function getCurrentUserId(): Promise<string | null> {
  const mode = await getAuthMode();
  if (mode === 'authenticated') {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  }
  if (mode === 'guest') {
    return getLocalUserId();
  }
  return null;
}

export async function setupGuestUser(): Promise<string> {
  const localUserId = generateId();
  await AsyncStorage.multiSet([
    ['auth_mode', 'guest'],
    ['local_user_id', localUserId],
    ['has_completed_onboarding', 'false'],
  ]);

  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles (id, subscription_tier) VALUES (?, 'free')`,
    [localUserId]
  );

  return localUserId;
}

export async function updateLocalProfile(userId: string, updates: Partial<Profile>): Promise<void> {
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

  fields.push(`updated_at = datetime('now')`);
  values.push(userId);

  await db.runAsync(
    `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function getLocalProfile(userId: string): Promise<Profile | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  return result ?? null;
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem('has_completed_onboarding', 'true');
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem('has_completed_onboarding');
  return value === 'true';
}

export async function signOut(): Promise<void> {
  const mode = await getAuthMode();
  if (mode === 'authenticated') {
    await supabase.auth.signOut();
  }
  await AsyncStorage.multiSet([
    ['auth_mode', 'none'],
    ['has_completed_onboarding', 'false'],
  ]);
  await AsyncStorage.removeItem('local_user_id');
}
