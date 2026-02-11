import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { GOAL_OPTIONS } from '@/lib/constants';

export default function GoalsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleGoal = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Your Goals</Text>
        <Text className="text-lg text-gray-600 mb-8">
          What would you like to achieve? Select all that apply.
        </Text>

        <View className="gap-3">
          {GOAL_OPTIONS.map(({ value, label }) => {
            const isSelected = selected.includes(value);
            return (
              <TouchableOpacity
                key={value}
                onPress={() => toggleGoal(value)}
                className={`p-4 rounded-xl border-2 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Text
                  className={`text-lg font-medium ${
                    isSelected ? 'text-primary-700' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Button
          title="Next"
          onPress={() => router.push('/(onboarding)/schedule')}
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}
