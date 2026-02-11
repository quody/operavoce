import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotificationPreferences, updateNotificationPreferences, scheduleDailyReminder, scheduleStreakReminder, cancelNotificationsByTag } from '@/services/notificationService';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    daily_reminder_enabled: true,
    streak_reminder_enabled: true,
    weekly_summary_enabled: true,
    milestone_notifications: true,
  });

  useEffect(() => {
    getNotificationPreferences().then((data) => {
      if (data) {
        setPrefs({
          daily_reminder_enabled: Boolean(data.daily_reminder_enabled),
          streak_reminder_enabled: Boolean(data.streak_reminder_enabled),
          weekly_summary_enabled: Boolean(data.weekly_summary_enabled),
          milestone_notifications: Boolean(data.milestone_notifications),
        });
      }
    });
  }, []);

  const togglePref = async (key: string, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    await updateNotificationPreferences({ [key]: value ? 1 : 0 });

    if (key === 'daily_reminder_enabled') {
      if (value) {
        await scheduleDailyReminder(18, 0);
      } else {
        await cancelNotificationsByTag('daily-reminder');
      }
    }
    if (key === 'streak_reminder_enabled') {
      if (value) {
        await scheduleStreakReminder(20, 0);
      } else {
        await cancelNotificationsByTag('streak-reminder');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-surface-200">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 p-1">
          <Text className="text-primary-600 text-lg">{'\u2039'}</Text>
          <Text className="text-primary-600">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-900 ml-3">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        <View className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {[
            { key: 'daily_reminder_enabled', title: 'Daily Practice Reminder', desc: '30 min before scheduled session' },
            { key: 'streak_reminder_enabled', title: 'Streak Reminder', desc: '8:00 PM if no session logged' },
            { key: 'weekly_summary_enabled', title: 'Weekly Summary', desc: 'Sunday at 10:00 AM' },
            { key: 'milestone_notifications', title: 'Milestone Celebrations', desc: 'When you reach a new milestone' },
          ].map((item, index) => (
            <View
              key={item.key}
              className={`flex-row items-center justify-between p-4 ${
                index > 0 ? 'border-t border-surface-200' : ''
              }`}
            >
              <View className="flex-1 mr-4">
                <Text className="text-base text-stone-900 font-medium">{item.title}</Text>
                <Text className="text-xs text-stone-400 mt-0.5">{item.desc}</Text>
              </View>
              <Switch
                value={prefs[item.key as keyof typeof prefs]}
                onValueChange={(val) => togglePref(item.key, val)}
                trackColor={{ false: '#d6d3d1', true: '#7c3aed' }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
