import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { VOICE_TYPES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { updateLocalProfile } from '@/services/authService';

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Your Voice Type</Text>
        <Text className="text-lg text-gray-600 mb-8">
          Select your voice type so we can recommend the right programs for you.
        </Text>

        <View className="gap-3">
          {VOICE_TYPES.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSelected(value)}
              className={`p-4 rounded-xl border-2 ${
                selected === value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Text
                className={`text-lg font-medium ${
                  selected === value ? 'text-primary-700' : 'text-gray-700'
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
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}
