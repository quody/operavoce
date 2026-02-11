import React from 'react';
import { View, Text } from 'react-native';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <View className="bg-gradient-to-r from-accent-500 to-accent-600 bg-accent-500 rounded-2xl p-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-white text-sm font-medium opacity-80">Current Streak</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-white text-4xl font-bold">{currentStreak}</Text>
            <Text className="text-white text-lg">day{currentStreak !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-white text-sm opacity-80">Best</Text>
          <Text className="text-white text-2xl font-bold">{longestStreak}</Text>
        </View>
      </View>
    </View>
  );
}
