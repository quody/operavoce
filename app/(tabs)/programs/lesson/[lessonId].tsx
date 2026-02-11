import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TextLesson } from '@/components/lesson/TextLesson';
import { ExerciseCard } from '@/components/lesson/ExerciseCard';
import { AudioPlayer } from '@/components/lesson/AudioPlayer';
import { QuizCard } from '@/components/lesson/QuizCard';
import { Button } from '@/components/common/Button';
import { useLessonDetail } from '@/hooks/usePrograms';

export default function LessonViewerScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { data: lesson, isLoading } = useLessonDetail(lessonId);
  const [completed, setCompleted] = useState(false);

  if (isLoading || !lesson) {
    return <LoadingSpinner fullScreen />;
  }

  const handleComplete = () => {
    setCompleted(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-primary-500 text-base">Close</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-900 flex-1 text-center" numberOfLines={1}>
          {lesson.title}
        </Text>
        <View className="w-12" />
      </View>

      {/* Lesson Content */}
      <View className="flex-1">
        {lesson.type === 'text' && (
          <TextLesson title={lesson.title} content={lesson.content} />
        )}

        {lesson.type === 'exercise' && lesson.content.exercise && (
          <View className="flex-1 px-4 py-4 justify-center">
            <ExerciseCard
              title={lesson.title}
              config={lesson.content.exercise}
              onComplete={handleComplete}
            />
          </View>
        )}

        {lesson.type === 'audio' && lesson.audio_url && (
          <View className="flex-1 px-4 py-4 justify-center">
            <AudioPlayer url={lesson.audio_url} title={lesson.title} />
          </View>
        )}

        {lesson.type === 'quiz' && lesson.content.quiz && (
          <View className="flex-1 px-4 py-4">
            <QuizCard config={lesson.content.quiz} onComplete={handleComplete} />
          </View>
        )}
      </View>

      {/* Footer */}
      {(lesson.type === 'text' || lesson.type === 'audio' || completed) && (
        <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-100">
          <Button
            title={completed ? 'Done' : 'Mark as Complete'}
            onPress={() => {
              handleComplete();
              router.back();
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}
