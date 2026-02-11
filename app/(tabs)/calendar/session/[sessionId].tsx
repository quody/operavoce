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
import {
  useSessionDetail, useCompleteSession, useSkipSession,
  useRescheduleSession, useRescheduleAllOnWeekday,
} from '@/hooks/useSessions';
import { TimePicker } from '@/components/common/TimePicker';
import { useSessionStore } from '@/stores/sessionStore';
import { RATING_LABELS } from '@/lib/constants';
import { formatDate, formatTime, addDays } from '@/utils/datetime';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSessionDetail(sessionId);
  const completeMutation = useCompleteSession();
  const skipMutation = useSkipSession();
  const rescheduleMutation = useRescheduleSession();
  const rescheduleAllMutation = useRescheduleAllOnWeekday();
  const { activeSession, startSession, endSession, completeLesson, nextLesson, previousLesson } = useSessionStore();

  const [showCompletion, setShowCompletion] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rating, setRating] = useState(3);
  const [journalNote, setJournalNote] = useState('');

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('18:00');
  const [rescheduleMode, setRescheduleMode] = useState<'single' | 'all'>('single');
  const [newWeekday, setNewWeekday] = useState(1);

  if (isLoading || !session) {
    return <LoadingSpinner fullScreen />;
  }

  const sessionDate = new Date(session.scheduled_date + 'T00:00:00');
  const sessionWeekday = sessionDate.getDay();
  const sessionTime = session.scheduled_time ?? '18:00';

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

  const openReschedule = () => {
    // Default to current session values
    setRescheduleDate(session.scheduled_date);
    setRescheduleTime(sessionTime);
    setNewWeekday(sessionWeekday);
    setRescheduleMode('single');
    setShowReschedule(true);
  };

  const handleReschedule = async () => {
    try {
      if (rescheduleMode === 'single') {
        await rescheduleMutation.mutateAsync({
          sessionId,
          newDate: rescheduleDate,
          newTime: rescheduleTime,
        });
        Alert.alert('Rescheduled', 'Session has been moved.', [
          { text: 'OK', onPress: () => { setShowReschedule(false); router.back(); } },
        ]);
      } else {
        await rescheduleAllMutation.mutateAsync({
          oldWeekday: sessionWeekday,
          oldTime: sessionTime,
          newWeekday,
          newTime: rescheduleTime,
        });
        const count = 'All';
        Alert.alert(
          'Rescheduled',
          `${count} ${DAY_LABELS[sessionWeekday]} sessions moved to ${DAY_LABELS[newWeekday]} at ${formatTime(rescheduleTime)}.`,
          [{ text: 'OK', onPress: () => { setShowReschedule(false); router.back(); } }],
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to reschedule.');
    }
  };

  // Date navigation for single reschedule
  const shiftDate = (days: number) => {
    setRescheduleDate(addDays(rescheduleDate, days));
  };

  // Reschedule UI
  if (showReschedule) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50">
        <View className="px-5 py-4 bg-white border-b border-surface-200 flex-row items-center">
          <TouchableOpacity onPress={() => setShowReschedule(false)} className="flex-row items-center gap-1 p-1">
            <Text className="text-primary-600 text-lg">{'\u2039'}</Text>
            <Text className="text-primary-600">Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-stone-900 ml-3">Reschedule</Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-6">
          {/* Mode selector */}
          <View className="flex-row gap-2 mb-8">
            <TouchableOpacity
              onPress={() => setRescheduleMode('single')}
              className={`flex-1 p-4 rounded-2xl border-2 ${
                rescheduleMode === 'single' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-white'
              }`}
            >
              <Text className={`text-sm font-semibold mb-0.5 ${rescheduleMode === 'single' ? 'text-primary-700' : 'text-stone-700'}`}>
                This session
              </Text>
              <Text className="text-xs text-stone-400">Move just this one</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRescheduleMode('all')}
              className={`flex-1 p-4 rounded-2xl border-2 ${
                rescheduleMode === 'all' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-white'
              }`}
            >
              <Text className={`text-sm font-semibold mb-0.5 ${rescheduleMode === 'all' ? 'text-primary-700' : 'text-stone-700'}`}>
                All {DAY_LABELS[sessionWeekday]} sessions
              </Text>
              <Text className="text-xs text-stone-400">at {formatTime(sessionTime)}</Text>
            </TouchableOpacity>
          </View>

          {rescheduleMode === 'single' ? (
            <>
              {/* Date picker for single */}
              <Text className="text-sm font-semibold text-stone-700 mb-3">New date</Text>
              <View className="flex-row items-center justify-between bg-white border border-surface-200 rounded-2xl p-4 mb-6">
                <TouchableOpacity onPress={() => shiftDate(-1)} className="px-3 py-1">
                  <Text className="text-primary-600 text-lg font-medium">{'\u2039'}</Text>
                </TouchableOpacity>
                <View className="items-center">
                  <Text className="text-base font-semibold text-stone-900">{formatDate(rescheduleDate)}</Text>
                  <Text className="text-xs text-stone-400">{DAY_LABELS[new Date(rescheduleDate + 'T00:00:00').getDay()]}</Text>
                </View>
                <TouchableOpacity onPress={() => shiftDate(1)} className="px-3 py-1">
                  <Text className="text-primary-600 text-lg font-medium">{'\u203A'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Weekday picker for bulk */}
              <Text className="text-sm font-semibold text-stone-700 mb-3">Move to</Text>
              <View className="flex-row gap-1.5 mb-6">
                {DAY_LABELS.map((label, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setNewWeekday(i)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      newWeekday === i
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white border-surface-200'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${newWeekday === i ? 'text-white' : 'text-stone-500'}`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Time picker (shared) */}
          <Text className="text-sm font-semibold text-stone-700 mb-3">New time</Text>
          <View className="mb-8">
            <TimePicker value={rescheduleTime} onChange={setRescheduleTime} />
          </View>
        </ScrollView>

        <View className="px-5 pb-8 pt-4">
          <Button
            title={rescheduleMode === 'single' ? 'Reschedule Session' : `Reschedule All ${DAY_LABELS[sessionWeekday]} Sessions`}
            onPress={handleReschedule}
            variant="primary"
            size="lg"
            fullWidth
            loading={rescheduleMutation.isPending || rescheduleAllMutation.isPending}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Completion form
  if (showCompletion) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50">
        <ScrollView className="flex-1 px-5 pt-8">
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-success-50 items-center justify-center mb-4">
              <Text className="text-success-500 text-3xl">{'\u2713'}</Text>
            </View>
            <Text className="text-2xl font-bold text-stone-900">Session Complete!</Text>
          </View>

          <Text className="text-base font-semibold text-stone-700 mb-4">How did it go?</Text>
          <View className="flex-row justify-between mb-8 px-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} className="items-center">
                <Text className={`text-3xl ${rating >= star ? 'text-accent-500' : 'text-surface-300'}`}>
                  {rating >= star ? '\u2605' : '\u2606'}
                </Text>
                <Text className="text-xs text-stone-500 mt-1">{RATING_LABELS[star - 1]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-semibold text-stone-700 mb-3">Journal Note (optional)</Text>
          <TextInput
            value={journalNote}
            onChangeText={setJournalNote}
            placeholder="How was your practice? Any observations?"
            placeholderTextColor="#a8a29e"
            multiline
            numberOfLines={4}
            className="bg-white border border-surface-200 rounded-2xl p-4 text-base text-stone-700 min-h-[120px]"
            textAlignVertical="top"
          />
        </ScrollView>

        <View className="px-5 pb-8 pt-4">
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
      <SafeAreaView className="flex-1 bg-surface-50">
        {/* Progress */}
        <View className="px-5 py-3 bg-white border-b border-surface-200">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-sm text-stone-500 font-medium">
              Lesson {activeSession.currentLessonIndex + 1} of {activeSession.lessons.length}
            </Text>
            <TouchableOpacity onPress={() => setShowCompletion(true)}>
              <Text className="text-primary-600 text-sm font-semibold">Finish Early</Text>
            </TouchableOpacity>
          </View>
          <View className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
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
            <View className="flex-1 px-5 justify-center">
              <ExerciseCard
                title={currentLesson.title}
                config={currentLesson.content.exercise}
                onComplete={() => handleCompleteLesson(currentLesson.id)}
              />
            </View>
          )}
          {currentLesson.type === 'quiz' && currentLesson.content.quiz && (
            <View className="flex-1 px-5 py-4">
              <QuizCard
                config={currentLesson.content.quiz}
                onComplete={() => handleCompleteLesson(currentLesson.id)}
              />
            </View>
          )}
        </View>

        {/* Navigation */}
        {currentLesson.type === 'text' && (
          <View className="flex-row px-5 pb-8 pt-4 gap-3 bg-white border-t border-surface-200">
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
    <SafeAreaView className="flex-1 bg-surface-50">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center gap-1">
          <Text className="text-primary-600 text-lg">{'\u2039'}</Text>
          <Text className="text-primary-600">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-stone-900 mb-1">
          {session.program_title ?? 'Practice Session'}
        </Text>
        <Text className="text-stone-500 mb-2">
          {formatDate(session.scheduled_date)}
          {session.scheduled_time ? ` at ${formatTime(session.scheduled_time)}` : ''}
        </Text>

        {/* Reschedule link */}
        {session.status === 'upcoming' && (
          <TouchableOpacity onPress={openReschedule} className="mb-6">
            <Text className="text-primary-600 text-sm font-medium">Reschedule</Text>
          </TouchableOpacity>
        )}

        {/* Goals */}
        {session.goals.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-stone-800 mb-3">Goals</Text>
            {session.goals.map((goal) => (
              <Card key={goal.id} className="mb-2">
                <Text className="text-sm text-stone-700">{goal.description}</Text>
                {goal.target_value && (
                  <Text className="text-xs text-stone-400 mt-1">Target: {goal.target_value}</Text>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Lessons */}
        <Text className="text-lg font-semibold text-stone-800 mb-3">
          Lessons ({session.lessons.length})
        </Text>
        {session.lessons.map((lesson, index) => (
          <Card key={lesson.id} className="mb-2">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-primary-50 items-center justify-center">
                <Text className="text-primary-600 font-bold text-sm">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-stone-900">{lesson.title}</Text>
                <Text className="text-xs text-stone-400 capitalize">{lesson.type}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View className="px-5 pb-8 pt-4 flex-row gap-3">
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
