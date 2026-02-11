import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { registerForPushNotifications, scheduleDailyReminder, scheduleStreakReminder } from '@/services/notificationService';
import { markOnboardingComplete } from '@/services/authService';
import { useUIStore } from '@/stores/uiStore';
import { seedDefaultPrograms } from '@/services/programService';

export default function NotificationsScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useUIStore();

  const handleEnable = async () => {
    await registerForPushNotifications();
    await scheduleDailyReminder(18, 0);
    await scheduleStreakReminder(20, 0);
    await finishOnboarding();
  };

  const handleSkip = async () => {
    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    await seedDefaultPrograms();
    await markOnboardingComplete();
    setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">&#128276;</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Stay on Track
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-7">
            Get reminders for your practice sessions and celebrate your streaks. You can customize these anytime in Settings.
          </Text>
        </View>

        <View className="gap-4">
          <Button
            title="Enable Notifications"
            onPress={handleEnable}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Maybe Later"
            onPress={handleSkip}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
