import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { StepIndicator } from '@/components/common/StepIndicator';
import { VOICE_TYPES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { updateLocalProfile } from '@/services/authService';

const VOICE_RANGES: Record<string, string> = {
  soprano: 'C4 - C6',
  mezzo_soprano: 'A3 - A5',
  contralto: 'F3 - F5',
  tenor: 'C3 - C5',
  baritone: 'A2 - A4',
  bass: 'E2 - E4',
};

export default function VoiceTypeScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = async () => {
    if (selected && userId) {
      await updateLocalProfile(userId, { voice_type: selected as any });
    }
    router.push('/(onboarding)/experience');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-950">
      <StepIndicator totalSteps={3} currentStep={1} />

      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-3xl font-bold mb-2">Your Voice Type</Text>
        <Text className="text-primary-300 text-base mb-8">
          Select your voice type so we can recommend the right programs.
        </Text>

        <View className="gap-3">
          {VOICE_TYPES.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSelected(value)}
              className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${
                selected === value
                  ? 'border-accent-400 bg-primary-800'
                  : 'border-primary-700 bg-primary-900'
              }`}
            >
              <Text
                className={`text-lg font-medium ${
                  selected === value ? 'text-accent-300' : 'text-primary-200'
                }`}
              >
                {label}
              </Text>
              <Text
                className={`text-sm ${
                  selected === value ? 'text-accent-400' : 'text-primary-500'
                }`}
              >
                {VOICE_RANGES[value]}
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
