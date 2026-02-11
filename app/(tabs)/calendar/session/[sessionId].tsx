import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { TextLesson } from '@/components/lesson/TextLesson';
import { ExerciseCard } from '@/components/lesson/ExerciseCard';
import { QuizCard } from '@/components/lesson/QuizCard';
import { useSessionDetail, useCompleteSession, useSkipSession } from '@/hooks/useSessions';
import { useSessionStore } from '@/stores/sessionStore';
import { RATING_LABELS } from '@/lib/constants';
import { formatDate } from '@/utils/datetime';

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSessionDetail(sessionId);
  const completeMutation = useCompleteSession();
  const skipMutation = useSkipSession();
  const { activeSession, startSession, endSession, completeLesson, nextLesson, previousLesson } = useSessionStore();

  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(3);
  const [journalNote, setJournalNote] = useState('');

  if (isLoading || !session) {
    return <LoadingSpinner fullScreen />;
  }

  const handleStartSession = () => {
    startSession(sessionId, session.lessons, session.goals);
  };

  const handleCompleteLesson = (lessonId: string) => {
    completeLesson(lessonId);
    if (activeSession && activeSession.currentLessonIndex < activeSession.lessons.length - 1) {
      nextLesson();
    } else {
      setShowCompletion(true);
    }
  };

  const handleFinishSession = async () => {
    const elapsed = activeSession?.elapsedSeconds ?? 0;
    const durationMin = Math.max(1, Math.round(elapsed / 60));

    try {
      await completeMutation.mutateAsync({
        sessionId,
        rating,
        note: journalNote || undefined,
        durationMin,
      });
      endSession();
      Alert.alert('Session Complete!', 'Great work! Keep up the practice.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save session.');
    }
  };

  const handleSkip = async () => {
    try {
      await skipMutation.mutateAsync(sessionId);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to skip session.');
    }
  };

  // Completion form
  if (showCompletion) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-4 pt-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">Session Complete!</Text>

          <Text className="text-base font-semibold text-gray-700 mb-3">How did it go?</Text>
          <View className="flex-row justify-between mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} className="items-center">
                <Text className={`text-3xl ${rating >= star ? 'text-accent-500' : 'text-gray-300'}`}>
                  {rating >= star ? '\u2605' : '\u2606'}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">{RATING_LABELS[star - 1]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-2">Journal Note (optional)</Text>
          <TextInput
            value={journalNote}
            onChangeText={setJournalNote}
            placeholder="How was your practice? Any observations?"
            multiline
            numberOfLines={4}
            className="bg-white border border-gray-200 rounded-xl p-4 text-base text-gray-700 min-h-[100px]"
            textAlignVertical="top"
          />
        </ScrollView>

        <View className="px-4 pb-6">
          <Button
            title="Save & Finish"
            onPress={handleFinishSession}
            variant="primary"
            size="lg"
            fullWidth
            loading={completeMutation.isPending}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Active session - showing current lesson
  if (activeSession) {
    const currentLesson = activeSession.lessons[activeSession.currentLessonIndex];

    if (!currentLesson) {
      setShowCompletion(true);
      return null;
    }

    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Progress */}
        <View className="px-4 py-2 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-500">
              Lesson {activeSession.currentLessonIndex + 1} of {activeSession.lessons.length}
            </Text>
            <TouchableOpacity onPress={() => setShowCompletion(true)}>
              <Text className="text-primary-500 text-sm font-medium">Finish Early</Text>
            </TouchableOpacity>
          </View>
          <View className="h-1.5 bg-gray-200 rounded-full">
            <View
              className="h-1.5 bg-primary-500 rounded-full"
              style={{ width: `${((activeSession.currentLessonIndex + 1) / activeSession.lessons.length) * 100}%` }}
            />
          </View>
        </View>

        {/* Current Lesson */}
        <View className="flex-1">
          {currentLesson.type === 'text' && (
            <TextLesson title={currentLesson.title} content={currentLesson.content} />
          )}
          {currentLesson.type === 'exercise' && currentLesson.content.exercise && (
            <View className="flex-1 px-4 justify-center">
              <ExerciseCard
                title={currentLesson.title}
                config={currentLesson.content.exercise}
                onComplete={() => handleCompleteLesson(currentLesson.id)}
              />
            </View>
          )}
          {currentLesson.type === 'quiz' && currentLesson.content.quiz && (
            <View className="flex-1 px-4 py-4">
              <QuizCard
                config={currentLesson.content.quiz}
                onComplete={() => handleCompleteLesson(currentLesson.id)}
              />
            </View>
          )}
        </View>

        {/* Navigation */}
        {currentLesson.type === 'text' && (
          <View className="flex-row px-4 pb-6 pt-3 gap-3 bg-white border-t border-gray-100">
            {activeSession.currentLessonIndex > 0 && (
              <Button title="Previous" onPress={previousLesson} variant="outline" size="md" />
            )}
            <View className="flex-1">
              <Button
                title={activeSession.currentLessonIndex < activeSession.lessons.length - 1 ? 'Next' : 'Complete'}
                onPress={() => handleCompleteLesson(currentLesson.id)}
                variant="primary"
                size="md"
                fullWidth
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Session overview (not started yet)
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-primary-500">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 mb-1">
          {session.program_title ?? 'Practice Session'}
        </Text>
        <Text className="text-gray-500 mb-6">{formatDate(session.scheduled_date)}</Text>

        {/* Goals */}
        {session.goals.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Goals</Text>
            {session.goals.map((goal) => (
              <Card key={goal.id} className="mb-2">
                <Text className="text-sm text-gray-700">{goal.description}</Text>
                {goal.target_value && (
                  <Text className="text-xs text-gray-400 mt-1">Target: {goal.target_value}</Text>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Lessons */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Lessons ({session.lessons.length})
        </Text>
        {session.lessons.map((lesson, index) => (
          <Card key={lesson.id} className="mb-2">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                <Text className="text-primary-500 font-bold text-sm">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">{lesson.title}</Text>
                <Text className="text-xs text-gray-400 capitalize">{lesson.type}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View className="px-4 pb-6 pt-3 flex-row gap-3">
        <Button title="Skip" onPress={handleSkip} variant="outline" size="lg" loading={skipMutation.isPending} />
        <View className="flex-1">
          <Button
            title="Start Session"
            onPress={handleStartSession}
            variant="primary"
            size="lg"
            fullWidth
            disabled={session.lessons.length === 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
