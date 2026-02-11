import React from 'react';
import { View, Text } from 'react-native';

interface RatingChartProps {
  ratings: { date: string; rating: number }[];
}

export function RatingChart({ ratings }: RatingChartProps) {
  const recentRatings = ratings.slice(-14); // Last 14 sessions
  const maxRating = 5;

  if (recentRatings.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <Text className="text-base font-semibold text-gray-900 mb-3">Self-Rating Trend</Text>
        <Text className="text-gray-400 text-center py-4">
          Complete sessions to see your rating trend
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-semibold text-gray-900 mb-3">Self-Rating Trend</Text>
      <View className="flex-row items-end gap-1 h-24">
        {recentRatings.map((entry, index) => (
          <View key={index} className="flex-1 items-center justify-end">
            <View
              className="w-full rounded-t bg-primary-400"
              style={{ height: `${(entry.rating / maxRating) * 100}%` }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-400">Oldest</Text>
        <Text className="text-xs text-gray-400">Recent</Text>
      </View>
    </View>
  );
}
