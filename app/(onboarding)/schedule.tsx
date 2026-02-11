import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { PRACTICE_DAYS_OPTIONS, PRACTICE_TIME_OPTIONS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { updateLocalProfile } from '@/services/authService';

export default function ScheduleScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [preferredTime, setPreferredTime] = useState('18:00');

  const handleNext = async () => {
    if (userId) {
      await updateLocalProfile(userId, {
        practice_days_per_week: daysPerWeek,
        preferred_practice_time: preferredTime,
      });
    }
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Practice Schedule</Text>
        <Text className="text-lg text-gray-600 mb-8">
          How often would you like to practice?
        </Text>

        <Text className="text-base font-semibold text-gray-700 mb-3">Days per week</Text>
        <View className="flex-row gap-2 mb-8">
          {PRACTICE_DAYS_OPTIONS.map((days) => (
            <TouchableOpacity
              key={days}
              onPress={() => setDaysPerWeek(days)}
              className={`flex-1 py-3 rounded-xl items-center ${
                daysPerWeek === days
                  ? 'bg-primary-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  daysPerWeek === days ? 'text-white' : 'text-gray-700'
                }`}
              >
                {days}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-3">Preferred time</Text>
        <View className="gap-2">
          {PRACTICE_TIME_OPTIONS.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setPreferredTime(value)}
              className={`p-3 rounded-xl border-2 ${
                preferredTime === value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              }`}
            >
              <Text
                className={`text-base ${
                  preferredTime === value ? 'text-primary-700 font-medium' : 'text-gray-700'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Button
          title="Next"
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
