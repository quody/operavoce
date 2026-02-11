import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { getAuthMode, getCurrentUserId } from './authService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  // Store token
  const userId = await getCurrentUserId();
  if (userId) {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO notification_preferences (user_id, expo_push_token, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET expo_push_token = ?, updated_at = datetime('now')`,
      [userId, token, token]
    );

    const mode = await getAuthMode();
    if (mode === 'authenticated') {
      await supabase.from('notification_preferences').upsert({
        user_id: userId,
        expo_push_token: token,
      });
    }
  }

  return token;
}

export async function scheduleLocalReminder(params: {
  title: string;
  body: string;
  triggerDate: Date;
  data?: Record<string, string>;
}): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.triggerDate,
    },
  });
  return id;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  // Cancel existing daily reminders
  await cancelNotificationsByTag('daily-reminder');

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to Practice!',
      body: 'Your practice session is coming up. Let\'s warm up those pipes!',
      data: { type: 'daily-reminder', screen: '/(tabs)' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function scheduleStreakReminder(hour: number, minute: number): Promise<string> {
  await cancelNotificationsByTag('streak-reminder');

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Don\'t Break Your Streak!',
      body: 'You haven\'t practiced today. Even 5 minutes helps maintain your progress.',
      data: { type: 'streak-reminder', screen: '/(tabs)' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function cancelNotificationsByTag(tag: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === tag) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getNotificationPreferences(): Promise<Record<string, unknown> | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const db = await getDatabase();
  return db.getFirstAsync(
    'SELECT * FROM notification_preferences WHERE user_id = ?',
    [userId]
  );
}

export async function updateNotificationPreferences(updates: Record<string, unknown>): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'user_id') {
      fields.push(`${key} = ?`);
      values.push(value as string | number | null);
    }
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(userId);

  await db.runAsync(
    `UPDATE notification_preferences SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
}
