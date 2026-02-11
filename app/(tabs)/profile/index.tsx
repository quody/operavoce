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
    <SafeAreaView className="flex-1 bg-surface-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-stone-900">Profile</Text>
        </View>

        <View className="px-5 gap-5 pb-8">
          {/* User Info */}
          <Card>
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center">
                <Text className="text-primary-600 text-2xl font-bold">
                  {profile?.display_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-stone-900">
                  {profile?.display_name ?? 'Singer'}
                </Text>
                <Text className="text-sm text-stone-500 capitalize mt-0.5">
                  {profile?.voice_type?.replace('_', '-') ?? 'Voice type not set'} | {profile?.experience_level ?? 'Level not set'}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <View className={`w-2 h-2 rounded-full mr-2 ${state === 'authenticated' ? 'bg-success-500' : 'bg-accent-400'}`} />
                  <Text className="text-xs text-stone-400">
                    {state === 'authenticated' ? 'Synced' : 'Local mode'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Guest mode banner */}
          {state === 'guest' && (
            <Card className="bg-accent-50 border-accent-200">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-accent-100 items-center justify-center">
                  <Text className="text-accent-600">{'\u2601'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-accent-800 text-sm font-semibold">
                    Sign in to back up your data
                  </Text>
                  <Text className="text-accent-600 text-xs mt-0.5">
                    Sync across devices with Google
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/profile/account')}
                >
                  <Text className="text-accent-700 font-bold text-sm">Sign In</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Stats Summary */}
          {stats && (
            <Card>
              <Text className="text-base font-semibold text-stone-900 mb-4">Practice Stats</Text>
              <View className="gap-3">
                {[
                  { label: 'Total Practice Time', value: formatDuration(stats.total_practice_minutes) },
                  { label: 'Current Streak', value: `${stats.streak_current} days` },
                  { label: 'Longest Streak', value: `${stats.streak_longest} days` },
                  { label: 'Goal Hit Rate', value: `${Math.round(stats.goal_hit_rate)}%` },
                ].map(({ label, value }) => (
                  <View key={label} className="flex-row justify-between items-center">
                    <Text className="text-sm text-stone-500">{label}</Text>
                    <Text className="text-sm font-semibold text-stone-900">{value}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Settings Links */}
          <View>
            <Text className="text-lg font-bold text-stone-900 mb-3">Settings</Text>
            <Card onPress={() => router.push('/(tabs)/profile/notifications')} className="mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
                  <Text className="text-primary-500 text-sm">{'\uD83D\uDD14'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base text-stone-900 font-medium">Notifications</Text>
                  <Text className="text-xs text-stone-400 mt-0.5">Manage reminders and alerts</Text>
                </View>
                <Text className="text-stone-300">{'\u203A'}</Text>
              </View>
            </Card>
            <Card onPress={() => router.push('/(tabs)/profile/account')}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
                  <Text className="text-primary-500 text-sm">{'\u2699'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base text-stone-900 font-medium">Account</Text>
                  <Text className="text-xs text-stone-400 mt-0.5">Sign in, sign out, manage data</Text>
                </View>
                <Text className="text-stone-300">{'\u203A'}</Text>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
