import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePrograms, useUserPrograms } from '@/hooks/usePrograms';
import { useProgramBuilderStore } from '@/stores/programBuilderStore';
import { Program } from '@/types/database';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-accent-100 text-accent-700',
  advanced: 'bg-primary-100 text-primary-700',
};

export default function ProgramCatalogScreen() {
  const router = useRouter();
  const { data: programs = [], isLoading, error } = usePrograms();
  const { data: userPrograms = [] } = useUserPrograms();
  const resetDraft = useProgramBuilderStore((s) => s.resetDraft);

  const enrolledProgramIds = new Set(userPrograms.map((up: any) => up.program_id));

  const handleCreateProgram = () => {
    resetDraft();
    router.push('/(tabs)/programs/create');
  };

  const renderProgram = ({ item }: { item: Program }) => {
    const isEnrolled = enrolledProgramIds.has(item.id);
    const levelStyle = (item.level ? LEVEL_COLORS[item.level] : null) ?? 'bg-stone-100 text-stone-700';

    return (
      <Card onPress={() => router.push(`/(tabs)/programs/${item.id}`)} className="mb-4">
        <View className="flex-row items-start gap-4">
          <View className="w-12 h-12 rounded-2xl bg-primary-50 items-center justify-center">
            <Text className="text-primary-500 text-lg">{'\u266B'}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-base font-bold text-stone-900 flex-1">{item.title}</Text>
              {item.is_free && (
                <View className="bg-success-50 px-2.5 py-0.5 rounded-full">
                  <Text className="text-success-600 text-xs font-semibold">Free</Text>
                </View>
              )}
              {isEnrolled && (
                <View className="bg-primary-50 px-2.5 py-0.5 rounded-full">
                  <Text className="text-primary-600 text-xs font-semibold">Enrolled</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-stone-500 mb-3" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="flex-row items-center gap-3">
              <View className={`px-2.5 py-0.5 rounded-full ${levelStyle.split(' ')[0]}`}>
                <Text className={`text-xs font-medium capitalize ${levelStyle.split(' ')[1]}`}>
                  {item.level}
                </Text>
              </View>
              {item.duration_weeks && (
                <Text className="text-xs text-stone-400">{item.duration_weeks} weeks</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading programs..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <View className="px-6 pt-6 pb-4 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-stone-900">Programs</Text>
          <Text className="text-sm text-stone-500 mt-1">Structured training to develop your voice</Text>
        </View>
        <Button
          title="+ Create"
          onPress={handleCreateProgram}
          variant="primary"
          size="sm"
        />
      </View>

      {error && (
        <View className="px-6 pb-3">
          <Text className="text-sm text-error-500">
            Failed to load programs from Supabase. Check your connection.
          </Text>
        </View>
      )}

      <FlatList
        data={programs}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-stone-400 text-base mb-4">No programs yet</Text>
            <Button
              title="Create Your First Program"
              onPress={handleCreateProgram}
              variant="outline"
              size="md"
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
