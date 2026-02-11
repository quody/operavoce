import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TimePicker } from '@/components/common/TimePicker';
import { useProgramDetail, useUserPrograms, useEnrollProgram } from '@/hooks/usePrograms';

const LESSON_TYPE_ICONS: Record<string, string> = {
  text: '\u2261',
  exercise: '\u266B',
  audio: '\u266A',
  quiz: '\u2753',
  video: '\u25B6',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgramDetail(programId);
  const { data: userPrograms = [] } = useUserPrograms();
  const enrollMutation = useEnrollProgram();

  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [selectedTime, setSelectedTime] = useState('18:00');

  const enrollment = userPrograms.find((up: any) => up.program_id === programId);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleEnroll = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one practice day.');
      return;
    }
    try {
      await enrollMutation.mutateAsync({
        programId,
        schedule: { weekdays: selectedDays, time: selectedTime },
      });
      Alert.alert(
        'Enrolled!',
        'Sessions have been added to your calendar. You can reschedule individual sessions anytime from the Calendar tab.'
      );
      setShowSchedule(false);
    } catch {
      Alert.alert('Error', 'Failed to enroll in program.');
    }
  };

  if (isLoading || !program) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-900 px-6 pt-4 pb-10">
          <TouchableOpacity onPress={() => router.back()} className="mb-5 flex-row items-center gap-1">
            <Text className="text-primary-300 text-lg">{'\u2039'}</Text>
            <Text className="text-primary-300 text-base">Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mb-2">{program.title}</Text>
          <Text className="text-primary-300 text-base leading-6 mb-5">{program.description}</Text>
          <View className="flex-row gap-3">
            <View className="bg-primary-800 px-3.5 py-1.5 rounded-full border border-primary-700">
              <Text className="text-primary-200 text-sm capitalize">{program.level}</Text>
            </View>
            {program.duration_weeks && (
              <View className="bg-primary-800 px-3.5 py-1.5 rounded-full border border-primary-700">
                <Text className="text-primary-200 text-sm">{program.duration_weeks} weeks</Text>
              </View>
            )}
            {program.is_free && (
              <View className="bg-success-600 px-3.5 py-1.5 rounded-full">
                <Text className="text-white text-sm font-medium">Free</Text>
              </View>
            )}
          </View>
        </View>

        {/* Enrollment / Schedule Card */}
        <View className="px-5 -mt-5 mb-5">
          {enrollment ? (
            <Card>
              <Text className="text-sm text-stone-500 mb-2">Your Progress</Text>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-stone-900">
                  {Math.round(enrollment.percent_complete)}% complete
                </Text>
              </View>
              <View className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <View
                  className="h-3 bg-primary-500 rounded-full"
                  style={{ width: `${enrollment.percent_complete}%` }}
                />
              </View>
            </Card>
          ) : showSchedule ? (
            <Card>
              <Text className="text-base font-bold text-stone-900 mb-1">Schedule Sessions</Text>
              <Text className="text-xs text-stone-400 mb-5">Pick your practice days and time</Text>

              {/* Day selector */}
              <Text className="text-sm font-semibold text-stone-700 mb-3">Practice days</Text>
              <View className="flex-row gap-1.5 mb-6">
                {DAY_LABELS.map((label, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleDay(i)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      selectedDays.includes(i)
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-surface-50 border-surface-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedDays.includes(i) ? 'text-white' : 'text-stone-500'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time selector */}
              <Text className="text-sm font-semibold text-stone-700 mb-3">Practice time</Text>
              <View className="mb-6">
                <TimePicker value={selectedTime} onChange={setSelectedTime} />
              </View>

              <Text className="text-xs text-stone-400 mb-4 text-center">
                You can reschedule sessions anytime from the Calendar
              </Text>

              <Button
                title="Enroll & Schedule"
                onPress={handleEnroll}
                variant="primary"
                size="lg"
                fullWidth
                loading={enrollMutation.isPending}
                disabled={selectedDays.length === 0}
              />
            </Card>
          ) : (
            <Card>
              <Button
                title="Enroll in Program"
                onPress={() => setShowSchedule(true)}
                variant="primary"
                size="lg"
                fullWidth
              />
            </Card>
          )}
        </View>

        {/* Modules */}
        <View className="px-5 pb-8">
          <Text className="text-lg font-bold text-stone-900 mb-5">Curriculum</Text>
          {program.modules.map((module, moduleIndex) => (
            <View key={module.id} className="mb-7">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-primary-600 text-sm font-bold">{moduleIndex + 1}</Text>
                </View>
                <Text className="text-base font-semibold text-stone-800 flex-1">
                  {module.title}
                </Text>
              </View>
              <View className="ml-4 gap-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <Card
                    key={lesson.id}
                    onPress={() => router.push(`/(tabs)/programs/lesson/${lesson.id}`)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-xl bg-surface-100 items-center justify-center">
                        <Text className="text-stone-500 text-sm">
                          {LESSON_TYPE_ICONS[lesson.type] ?? '\u2261'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-stone-900">
                          {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </Text>
                        <View className="flex-row gap-3 mt-0.5">
                          <Text className="text-xs text-stone-400 capitalize">{lesson.type}</Text>
                          {lesson.duration_estimate_min && (
                            <Text className="text-xs text-stone-400">{lesson.duration_estimate_min} min</Text>
                          )}
                        </View>
                      </View>
                      <Text className="text-stone-300 text-lg">{'\u203A'}</Text>
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
