import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { StepIndicator } from '@/components/common/StepIndicator';
import { EXPERIENCE_LEVELS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { updateLocalProfile } from '@/services/authService';

export default function ExperienceScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = async () => {
    if (selected && userId) {
      await updateLocalProfile(userId, { experience_level: selected as any });
    }
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-950">
      <StepIndicator totalSteps={3} currentStep={2} />

      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-3xl font-bold mb-2">Experience Level</Text>
        <Text className="text-primary-300 text-base mb-8">
          Tell us about your singing experience.
        </Text>

        <View className="gap-3">
          {EXPERIENCE_LEVELS.map(({ value, label, description }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSelected(value)}
              className={`p-5 rounded-2xl border-2 ${
                selected === value
                  ? 'border-accent-400 bg-primary-800'
                  : 'border-primary-700 bg-primary-900'
              }`}
            >
              <Text
                className={`text-lg font-semibold mb-1 ${
                  selected === value ? 'text-accent-300' : 'text-primary-200'
                }`}
              >
                {label}
              </Text>
              <Text className={`text-sm ${selected === value ? 'text-primary-300' : 'text-primary-500'}`}>
                {description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8 pt-4">
        <Button
          title="Next"
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}
