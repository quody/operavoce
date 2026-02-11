import React from 'react';
import { View, Text } from 'react-native';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <View className="bg-accent-500 rounded-3xl p-5 overflow-hidden">
      <View className="absolute top-0 right-0 w-24 h-24 rounded-full bg-accent-400 opacity-30" style={{ transform: [{ translateX: 30 }, { translateY: -30 }] }} />
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">Current Streak</Text>
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-white text-4xl font-bold">{currentStreak}</Text>
            <Text className="text-white/80 text-lg">day{currentStreak !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View className="items-end bg-white/15 rounded-2xl px-4 py-3">
          <Text className="text-white/70 text-xs font-medium mb-0.5">Best</Text>
          <Text className="text-white text-2xl font-bold">{longestStreak}</Text>
        </View>
      </View>
    </View>
  );
}
