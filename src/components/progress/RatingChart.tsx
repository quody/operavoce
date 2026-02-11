import React from 'react';
import { View, Text } from 'react-native';

interface RatingChartProps {
  ratings: { date: string; rating: number }[];
}

export function RatingChart({ ratings }: RatingChartProps) {
  const recentRatings = ratings.slice(-14);
  const maxRating = 5;

  if (recentRatings.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-5 border border-surface-200">
        <Text className="text-base font-semibold text-stone-900 mb-3">Self-Rating Trend</Text>
        <Text className="text-stone-400 text-center py-6 text-sm">
          Complete sessions to see your rating trend
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-5 border border-surface-200">
      <Text className="text-base font-semibold text-stone-900 mb-4">Self-Rating Trend</Text>
      <View className="flex-row items-end gap-1 h-24">
        {recentRatings.map((entry, index) => (
          <View key={index} className="flex-1 items-center justify-end">
            <View
              className="w-full rounded-t-sm bg-primary-400"
              style={{ height: `${(entry.rating / maxRating) * 100}%` }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-stone-400">Oldest</Text>
        <Text className="text-xs text-stone-400">Recent</Text>
      </View>
    </View>
  );
}
