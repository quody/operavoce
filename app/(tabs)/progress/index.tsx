import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { ProgressRing } from '@/components/progress/ProgressRing';
import { RatingChart } from '@/components/progress/RatingChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDashboardStats, useJournalEntries } from '@/hooks/useProgress';
import { useUserPrograms } from '@/hooks/usePrograms';
import { formatDuration } from '@/utils/datetime';

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: journal = [] } = useJournalEntries();
  const { data: userPrograms = [] } = useUserPrograms();

  const activePrograms = userPrograms.filter((p: any) => p.status === 'active');
  const ratingData = journal
    .filter((j) => j.self_rating !== null)
    .map((j) => ({ date: j.date, rating: j.self_rating! }))
    .reverse();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Progress</Text>
        </View>

        <View className="px-4 gap-4 pb-8">
          {/* Streak */}
          {stats && (
            <StreakBadge
              currentStreak={stats.streak_current}
              longestStreak={stats.streak_longest}
            />
          )}

          {/* Stats Grid */}
          {stats && (
            <View className="flex-row gap-3">
              <Card className="flex-1 items-center">
                <Text className="text-2xl font-bold text-primary-500">
                  {formatDuration(stats.total_practice_minutes)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Total Time</Text>
              </Card>
              <Card className="flex-1 items-center">
                <Text className="text-2xl font-bold text-primary-500">
                  {stats.sessions_this_week}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">This Week</Text>
              </Card>
            </View>
          )}

          {/* Goal Hit Rate & Avg Rating */}
          {stats && (
            <View className="flex-row gap-3">
              <Card className="flex-1 items-center">
                <ProgressRing
                  progress={stats.goal_hit_rate}
                  size={80}
                  label="Goal Hit Rate"
                />
              </Card>
              <Card className="flex-1 items-center">
                <Text className="text-3xl font-bold text-primary-500">
                  {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '-'}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">Avg Rating</Text>
                <Text className="text-xs text-gray-400">out of 5</Text>
              </Card>
            </View>
          )}

          {/* Program Progress */}
          {activePrograms.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">Program Progress</Text>
              {activePrograms.map((program: any) => (
                <Card key={program.id} className="mb-3">
                  <Text className="text-base font-semibold text-gray-900">{program.title}</Text>
                  <View className="mt-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-gray-500">{Math.round(program.percent_complete)}% complete</Text>
                      {program.target_end_date && (
                        <Text className="text-xs text-gray-400">Due: {program.target_end_date}</Text>
                      )}
                    </View>
                    <View className="h-3 bg-gray-200 rounded-full">
                      <View
                        className="h-3 bg-primary-500 rounded-full"
                        style={{ width: `${program.percent_complete}%` }}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Rating Chart */}
          <RatingChart ratings={ratingData} />

          {/* Journal Link */}
          <Card onPress={() => router.push('/(tabs)/progress/journal')}>
            <Text className="text-base font-semibold text-primary-500">Practice Journal</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {journal.length} entries recorded
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
