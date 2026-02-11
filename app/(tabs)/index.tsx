import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { useTodaySession } from '@/hooks/useSessions';
import { useUserPrograms } from '@/hooks/usePrograms';
import { useDashboardStats } from '@/hooks/useProgress';
import { formatTime, formatDuration } from '@/utils/datetime';

export default function HomeScreen() {
  const router = useRouter();
  const { data: todaySession } = useTodaySession();
  const { data: userPrograms = [] } = useUserPrograms();
  const { data: stats } = useDashboardStats();

  const activePrograms = userPrograms.filter((p: any) => p.status === 'active');

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-stone-500 text-sm font-medium tracking-wide uppercase">Welcome back</Text>
          <Text className="text-stone-900 text-2xl font-bold mt-1">OperaVoce</Text>
        </View>

        <View className="px-5 gap-5 pb-8">
          {/* Today's Session Hero */}
          <View className="bg-primary-900 rounded-3xl p-6 overflow-hidden">
            <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-700 opacity-30" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
            {todaySession ? (
              <View>
                <Text className="text-primary-300 text-xs font-semibold tracking-widest uppercase mb-2">Today's Session</Text>
                <Text className="text-white text-xl font-bold mb-1">Ready to practice</Text>
                {todaySession.scheduled_time && (
                  <Text className="text-primary-400 text-sm mb-4">
                    Scheduled for {formatTime(todaySession.scheduled_time)}
                  </Text>
                )}
                <Text className="text-primary-300 text-sm mb-5">
                  {todaySession.linked_lesson_ids.length} lesson{todaySession.linked_lesson_ids.length !== 1 ? 's' : ''} planned
                </Text>
                <Button
                  title="Start Session"
                  onPress={() => router.push(`/calendar/session/${todaySession.id}`)}
                  variant="secondary"
                  size="md"
                />
              </View>
            ) : (
              <View>
                <Text className="text-primary-300 text-xs font-semibold tracking-widest uppercase mb-2">Today</Text>
                <Text className="text-white text-xl font-bold mb-1">No session scheduled</Text>
                <Text className="text-primary-400 text-sm mb-5">
                  Start a free practice session or browse programs
                </Text>
                <View className="flex-row gap-3">
                  <Button
                    title="Free Practice"
                    onPress={() => router.push('/(tabs)/calendar')}
                    variant="secondary"
                    size="sm"
                  />
                  <Button
                    title="Browse Programs"
                    onPress={() => router.push('/(tabs)/programs')}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Streak */}
          {stats && (
            <StreakBadge
              currentStreak={stats.streak_current}
              longestStreak={stats.streak_longest}
            />
          )}

          {/* Active Programs */}
          {activePrograms.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-stone-900 mb-3">Active Programs</Text>
              {activePrograms.map((program: any) => (
                <Card
                  key={program.id}
                  onPress={() => router.push(`/(tabs)/programs/${program.program_id}`)}
                  className="mb-3"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-stone-900">{program.title}</Text>
                      <Text className="text-sm text-stone-500 capitalize mt-0.5">{program.level}</Text>
                    </View>
                    <Text className="text-sm font-bold text-primary-600">
                      {Math.round(program.percent_complete)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <View
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${program.percent_complete}%` }}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Quick Stats */}
          {stats && (
            <View>
              <Text className="text-lg font-bold text-stone-900 mb-3">This Week</Text>
              <View className="flex-row gap-3">
                <Card className="flex-1 items-center py-5">
                  <Text className="text-2xl font-bold text-primary-600">{stats.sessions_this_week}</Text>
                  <Text className="text-xs text-stone-500 mt-1 font-medium">Sessions</Text>
                </Card>
                <Card className="flex-1 items-center py-5">
                  <Text className="text-2xl font-bold text-primary-600">
                    {formatDuration(stats.weekly_practice_minutes)}
                  </Text>
                  <Text className="text-xs text-stone-500 mt-1 font-medium">Practice</Text>
                </Card>
                <Card className="flex-1 items-center py-5">
                  <Text className="text-2xl font-bold text-primary-600">
                    {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '-'}
                  </Text>
                  <Text className="text-xs text-stone-500 mt-1 font-medium">Avg Rating</Text>
                </Card>
              </View>
            </View>
          )}

          {/* Get Started CTA */}
          {activePrograms.length === 0 && (
            <View>
              <Text className="text-lg font-bold text-stone-900 mb-3">Get Started</Text>
              <Card onPress={() => router.push('/(tabs)/programs')}>
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center">
                    <Text className="text-primary-600 text-xl">{'\u266B'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-primary-600">Browse Training Programs</Text>
                    <Text className="text-sm text-stone-500 mt-0.5">
                      Find a program matching your goals
                    </Text>
                  </View>
                  <Text className="text-stone-300 text-lg">{'\u203A'}</Text>
                </View>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
