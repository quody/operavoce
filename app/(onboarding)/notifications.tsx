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
    <SafeAreaView className="flex-1 bg-primary-950">
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary-800 rounded-full items-center justify-center mb-8 border-2 border-primary-600">
            <Text className="text-3xl">{'\uD83D\uDD14'}</Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-4 text-center">
            Stay on Track
          </Text>
          <Text className="text-primary-300 text-base text-center leading-7">
            Get reminders for your practice sessions and celebrate your streaks.{'\n'}You can customize these anytime in Settings.
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
            dark
          />
        </View>
      </View>

      {/* Decorative bottom */}
      <View className="items-center pb-8">
        <Text className="text-primary-700 text-xs tracking-widest uppercase">
          Almost there
        </Text>
      </View>
    </SafeAreaView>
  );
}
