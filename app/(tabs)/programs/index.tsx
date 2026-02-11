import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePrograms, useUserPrograms } from '@/hooks/usePrograms';
import { Program } from '@/types/database';

export default function ProgramCatalogScreen() {
  const router = useRouter();
  const { data: programs = [], isLoading } = usePrograms();
  const { data: userPrograms = [] } = useUserPrograms();

  const enrolledProgramIds = new Set(userPrograms.map((up: any) => up.program_id));

  const renderProgram = ({ item }: { item: Program }) => {
    const isEnrolled = enrolledProgramIds.has(item.id);

    return (
      <Card onPress={() => router.push(`/(tabs)/programs/${item.id}`)} className="mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="text-sm text-gray-500 mt-1 capitalize">{item.level}</Text>
          </View>
          {item.is_free && (
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-medium">Free</Text>
            </View>
          )}
          {isEnrolled && (
            <View className="bg-primary-100 px-2 py-1 rounded-full">
              <Text className="text-primary-700 text-xs font-medium">Enrolled</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row gap-4 mt-3">
          {item.duration_weeks && (
            <Text className="text-xs text-gray-400">{item.duration_weeks} weeks</Text>
          )}
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading programs..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Programs</Text>
        <Text className="text-sm text-gray-500 mt-1">Structured training to develop your voice</Text>
      </View>

      <FlatList
        data={programs}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
