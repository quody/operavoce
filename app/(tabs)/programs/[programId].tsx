import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useProgramDetail, useUserPrograms, useEnrollProgram } from '@/hooks/usePrograms';

export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgramDetail(programId);
  const { data: userPrograms = [] } = useUserPrograms();
  const enrollMutation = useEnrollProgram();

  const enrollment = userPrograms.find((up: any) => up.program_id === programId);

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync(programId);
      Alert.alert('Enrolled!', 'You have been enrolled in this program. Check your calendar for scheduled sessions.');
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in program.');
    }
  };

  if (isLoading || !program) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-900 px-6 pt-4 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-primary-200 text-base">Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mb-2">{program.title}</Text>
          <Text className="text-primary-200 text-base leading-6">{program.description}</Text>
          <View className="flex-row gap-4 mt-4">
            <View className="bg-primary-800 px-3 py-1 rounded-full">
              <Text className="text-primary-200 text-sm capitalize">{program.level}</Text>
            </View>
            {program.duration_weeks && (
              <View className="bg-primary-800 px-3 py-1 rounded-full">
                <Text className="text-primary-200 text-sm">{program.duration_weeks} weeks</Text>
              </View>
            )}
            {program.is_free && (
              <View className="bg-green-900 px-3 py-1 rounded-full">
                <Text className="text-green-200 text-sm">Free</Text>
              </View>
            )}
          </View>
        </View>

        {/* Enrollment Status */}
        <View className="px-4 -mt-4 mb-4">
          {enrollment ? (
            <Card>
              <Text className="text-sm text-gray-500">Your Progress</Text>
              <View className="mt-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-700">{Math.round(enrollment.percent_complete)}% complete</Text>
                </View>
                <View className="h-3 bg-gray-200 rounded-full">
                  <View
                    className="h-3 bg-primary-500 rounded-full"
                    style={{ width: `${enrollment.percent_complete}%` }}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <Card>
              <Button
                title="Enroll in Program"
                onPress={handleEnroll}
                variant="primary"
                size="lg"
                fullWidth
                loading={enrollMutation.isPending}
              />
            </Card>
          )}
        </View>

        {/* Modules */}
        <View className="px-4 pb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Curriculum</Text>
          {program.modules.map((module, moduleIndex) => (
            <View key={module.id} className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Module {moduleIndex + 1}: {module.title}
              </Text>
              <View className="gap-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <Card
                    key={lesson.id}
                    onPress={() => router.push(`/(tabs)/programs/lesson/${lesson.id}`)}
                    className="ml-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900">
                          {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </Text>
                        <View className="flex-row gap-3 mt-1">
                          <Text className="text-xs text-gray-400 capitalize">{lesson.type}</Text>
                          {lesson.duration_estimate_min && (
                            <Text className="text-xs text-gray-400">{lesson.duration_estimate_min} min</Text>
                          )}
                        </View>
                      </View>
                      <Text className="text-gray-300 text-lg">&#x203A;</Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
