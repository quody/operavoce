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
    <SafeAreaView className="flex-1 bg-surface-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-stone-900">Progress</Text>
        </View>

        <View className="px-5 gap-5 pb-8">
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
              <Card className="flex-1 items-center py-5">
                <Text className="text-2xl font-bold text-primary-600">
                  {formatDuration(stats.total_practice_minutes)}
                </Text>
                <Text className="text-xs text-stone-500 mt-1 font-medium">Total Time</Text>
              </Card>
              <Card className="flex-1 items-center py-5">
                <Text className="text-2xl font-bold text-primary-600">
                  {stats.sessions_this_week}
                </Text>
                <Text className="text-xs text-stone-500 mt-1 font-medium">This Week</Text>
              </Card>
            </View>
          )}

          {/* Goal Hit Rate & Avg Rating */}
          {stats && (
            <View className="flex-row gap-3">
              <Card className="flex-1 items-center py-5">
                <ProgressRing
                  progress={stats.goal_hit_rate}
                  size={80}
                  label="Goal Hit Rate"
                />
              </Card>
              <Card className="flex-1 items-center py-5">
                <Text className="text-3xl font-bold text-primary-600">
                  {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '-'}
                </Text>
                <Text className="text-sm text-stone-500 mt-1">Avg Rating</Text>
                <Text className="text-xs text-stone-400">out of 5</Text>
              </Card>
            </View>
          )}

          {/* Program Progress */}
          {activePrograms.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-stone-900 mb-3">Program Progress</Text>
              {activePrograms.map((program: any) => (
                <Card key={program.id} className="mb-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-semibold text-stone-900">{program.title}</Text>
                    <Text className="text-sm font-bold text-primary-600">
                      {Math.round(program.percent_complete)}%
                    </Text>
                  </View>
                  <View className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <View
                      className="h-2.5 bg-primary-500 rounded-full"
                      style={{ width: `${program.percent_complete}%` }}
                    />
                  </View>
                  {program.target_end_date && (
                    <Text className="text-xs text-stone-400 mt-2">Due: {program.target_end_date}</Text>
                  )}
                </Card>
              ))}
            </View>
          )}

          {/* Rating Chart */}
          <RatingChart ratings={ratingData} />

          {/* Journal Link */}
          <Card onPress={() => router.push('/(tabs)/progress/journal')}>
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                <Text className="text-primary-600">{'\u270E'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary-600">Practice Journal</Text>
                <Text className="text-sm text-stone-500 mt-0.5">
                  {journal.length} entries recorded
                </Text>
              </View>
              <Text className="text-stone-300 text-lg">{'\u203A'}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
