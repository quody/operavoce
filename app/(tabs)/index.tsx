import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-sm text-gray-500">Welcome back</Text>
          <Text className="text-2xl font-bold text-gray-900">OperaVoce</Text>
        </View>

        <View className="px-4 gap-4 pb-8">
          {/* Today's Session Hero Card */}
          <Card className="bg-primary-900 border-0">
            {todaySession ? (
              <View>
                <Text className="text-primary-200 text-sm font-medium mb-1">Today's Session</Text>
                <Text className="text-white text-xl font-bold mb-2">Ready to practice</Text>
                {todaySession.scheduled_time && (
                  <Text className="text-primary-300 text-sm mb-4">
                    Scheduled for {formatTime(todaySession.scheduled_time)}
                  </Text>
                )}
                <Text className="text-primary-200 text-sm mb-4">
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
                <Text className="text-primary-200 text-sm font-medium mb-1">Today</Text>
                <Text className="text-white text-xl font-bold mb-2">No session scheduled</Text>
                <Text className="text-primary-300 text-sm mb-4">
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
          </Card>

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
              <Text className="text-lg font-bold text-gray-900 mb-3">Active Programs</Text>
              {activePrograms.map((program: any) => (
                <Card
                  key={program.id}
                  onPress={() => router.push(`/(tabs)/programs/${program.program_id}`)}
                  className="mb-3"
                >
                  <Text className="text-base font-semibold text-gray-900">{program.title}</Text>
                  <Text className="text-sm text-gray-500 capitalize mt-1">{program.level}</Text>
                  <View className="mt-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-gray-500">Progress</Text>
                      <Text className="text-xs font-medium text-primary-500">
                        {Math.round(program.percent_complete)}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full">
                      <View
                        className="h-2 bg-primary-500 rounded-full"
                        style={{ width: `${program.percent_complete}%` }}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Quick Stats */}
          {stats && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">This Week</Text>
              <View className="flex-row gap-3">
                <Card className="flex-1">
                  <Text className="text-2xl font-bold text-primary-500">{stats.sessions_this_week}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Sessions</Text>
                </Card>
                <Card className="flex-1">
                  <Text className="text-2xl font-bold text-primary-500">
                    {formatDuration(stats.weekly_practice_minutes)}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Practice Time</Text>
                </Card>
                <Card className="flex-1">
                  <Text className="text-2xl font-bold text-primary-500">
                    {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '-'}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Avg Rating</Text>
                </Card>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          {activePrograms.length === 0 && (
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-3">Get Started</Text>
              <Card onPress={() => router.push('/(tabs)/programs')}>
                <Text className="text-base font-semibold text-primary-500">Browse Training Programs</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Find a program that matches your goals and experience level
                </Text>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
