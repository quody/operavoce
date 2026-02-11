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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-primary-500">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-2">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white rounded-2xl border border-gray-100">
          {[
            { key: 'daily_reminder_enabled', title: 'Daily Practice Reminder', desc: '30 min before scheduled session' },
            { key: 'streak_reminder_enabled', title: 'Streak Reminder', desc: '8:00 PM if no session logged' },
            { key: 'weekly_summary_enabled', title: 'Weekly Summary', desc: 'Sunday at 10:00 AM' },
            { key: 'milestone_notifications', title: 'Milestone Celebrations', desc: 'When you reach a new milestone' },
          ].map((item, index) => (
            <View
              key={item.key}
              className={`flex-row items-center justify-between p-4 ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <View className="flex-1 mr-4">
                <Text className="text-base text-gray-900">{item.title}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{item.desc}</Text>
              </View>
              <Switch
                value={prefs[item.key as keyof typeof prefs]}
                onValueChange={(val) => togglePref(item.key, val)}
                trackColor={{ false: '#d1d5db', true: '#4a3f8f' }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
