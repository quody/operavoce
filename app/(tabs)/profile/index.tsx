import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStats } from '@/hooks/useProgress';
import { formatDuration } from '@/utils/datetime';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/profileService';

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useAuthStore();
  const { data: stats } = useDashboardStats();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>

        <View className="px-4 gap-4 pb-8">
          {/* User Info */}
          <Card>
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
                <Text className="text-primary-500 text-2xl font-bold">
                  {profile?.display_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {profile?.display_name ?? 'Singer'}
                </Text>
                <Text className="text-sm text-gray-500 capitalize">
                  {profile?.voice_type?.replace('_', '-') ?? 'Voice type not set'} | {profile?.experience_level ?? 'Level not set'}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {state === 'authenticated' ? 'Signed in' : 'Local mode'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Guest mode banner */}
          {state === 'guest' && (
            <Card className="bg-accent-50 border-accent-200">
              <Text className="text-accent-800 text-sm font-medium mb-1">
                Sign in to back up your data
              </Text>
              <Text className="text-accent-600 text-xs">
                Your progress is stored locally. Sign in with Google to sync across devices.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile/account')}
                className="mt-3"
              >
                <Text className="text-accent-600 font-semibold text-sm">Sign In</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Stats Summary */}
          {stats && (
            <Card>
              <Text className="text-base font-semibold text-gray-900 mb-3">Practice Stats</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Total Practice Time</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {formatDuration(stats.total_practice_minutes)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Current Streak</Text>
                  <Text className="text-sm font-medium text-gray-900">{stats.streak_current} days</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Longest Streak</Text>
                  <Text className="text-sm font-medium text-gray-900">{stats.streak_longest} days</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Goal Hit Rate</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {Math.round(stats.goal_hit_rate)}%
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Settings Links */}
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-3">Settings</Text>
            <Card onPress={() => router.push('/(tabs)/profile/notifications')} className="mb-2">
              <Text className="text-base text-gray-900">Notifications</Text>
              <Text className="text-xs text-gray-400 mt-0.5">Manage reminders and alerts</Text>
            </Card>
            <Card onPress={() => router.push('/(tabs)/profile/account')} className="mb-2">
              <Text className="text-base text-gray-900">Account</Text>
              <Text className="text-xs text-gray-400 mt-0.5">Sign in, sign out, manage data</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
