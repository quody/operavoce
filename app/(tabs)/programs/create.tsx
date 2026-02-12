import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LessonEditorModal } from '@/components/programs/LessonEditorModal';
import { useProgramBuilderStore } from '@/stores/programBuilderStore';
import { useSaveProgram } from '@/hooks/usePrograms';
import { ExperienceLevel, LessonType } from '@/types/database';
import type { LessonDraft } from '@/services/supabaseProgramService';

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const LESSON_TYPE_ICONS: Record<string, string> = {
  text: '\u2261',
  exercise: '\u266B',
  audio: '\u266A',
  quiz: '\u2753',
  video: '\u25B6',
};

export default function CreateProgramScreen() {
  const router = useRouter();
  const saveMutation = useSaveProgram();
  const {
    draft,
    setTitle,
    setDescription,
    setLevel,
    setDurationWeeks,
    setIsFree,
    addModule,
    updateModuleTitle,
    removeModule,
    addLesson,
    updateLesson,
    removeLesson,
    resetDraft,
  } = useProgramBuilderStore();

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [lessonModal, setLessonModal] = useState<{
    visible: boolean;
    moduleIndex: number;
    lessonIndex?: number;
    initial?: LessonDraft;
  }>({ visible: false, moduleIndex: 0 });

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    addModule(newModuleTitle.trim());
    setNewModuleTitle('');
  };

  const handleSaveLesson = useCallback(
    (lesson: LessonDraft) => {
      if (lessonModal.lessonIndex !== undefined) {
        updateLesson(lessonModal.moduleIndex, lessonModal.lessonIndex, lesson);
      } else {
        addLesson(lessonModal.moduleIndex, lesson);
      }
    },
    [lessonModal, addLesson, updateLesson],
  );

  const handlePublish = async () => {
    if (!draft.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a program title.');
      return;
    }
    if (draft.modules.length === 0) {
      Alert.alert('No Modules', 'Please add at least one module.');
      return;
    }
    const emptyModules = draft.modules.filter((m) => m.lessons.length === 0);
    if (emptyModules.length > 0) {
      Alert.alert(
        'Empty Modules',
        `The following modules have no lessons: ${emptyModules.map((m) => m.title).join(', ')}. Add lessons to continue.`,
      );
      return;
    }

    try {
      await saveMutation.mutateAsync(draft);
      resetDraft();
      Alert.alert('Saved', 'Program has been saved to Supabase.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save program.');
    }
  };

  const totalLessons = draft.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-primary-900 px-6 pt-4 pb-8">
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Discard?', 'Unsaved changes will be lost.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                      resetDraft();
                      router.back();
                    },
                  },
                ]);
              }}
              className="mb-5 flex-row items-center gap-1"
            >
              <Text className="text-primary-300 text-lg">{'\u2039'}</Text>
              <Text className="text-primary-300 text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Create Program</Text>
            <Text className="text-primary-300 text-sm mt-1">
              Build a training program with modules and lessons
            </Text>
          </View>

          <View className="px-5 -mt-4 pb-8">
            {/* --- Program Details Card --- */}
            <Card className="mb-5">
              <Text className="text-base font-bold text-stone-900 mb-4">Program Details</Text>

              <Text className="text-sm font-semibold text-stone-700 mb-1.5">Title</Text>
              <TextInput
                value={draft.title}
                onChangeText={setTitle}
                placeholder="e.g. Your First Notes"
                className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-4"
                placeholderTextColor="#a8a29e"
              />

              <Text className="text-sm font-semibold text-stone-700 mb-1.5">Description</Text>
              <TextInput
                value={draft.description}
                onChangeText={setDescription}
                placeholder="What will students learn?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-4 min-h-[80px]"
                placeholderTextColor="#a8a29e"
              />

              <Text className="text-sm font-semibold text-stone-700 mb-2">Level</Text>
              <View className="flex-row gap-2 mb-4">
                {LEVELS.map((l) => (
                  <TouchableOpacity
                    key={l.value}
                    onPress={() => setLevel(l.value)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      draft.level === l.value
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white border-surface-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        draft.level === l.value ? 'text-white' : 'text-stone-600'
                      }`}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-stone-700 mb-1.5">
                    Duration (weeks)
                  </Text>
                  <TextInput
                    value={draft.duration_weeks?.toString() ?? ''}
                    onChangeText={(v) => setDurationWeeks(v ? parseInt(v, 10) : null)}
                    placeholder="4"
                    keyboardType="number-pad"
                    className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900"
                    placeholderTextColor="#a8a29e"
                  />
                </View>
                <View className="flex-1 justify-end">
                  <TouchableOpacity
                    onPress={() => setIsFree(!draft.is_free)}
                    className={`py-3 rounded-xl items-center border ${
                      draft.is_free
                        ? 'bg-success-50 border-success-300'
                        : 'bg-white border-surface-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        draft.is_free ? 'text-success-700' : 'text-stone-500'
                      }`}
                    >
                      {draft.is_free ? 'Free Program' : 'Paid Program'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* --- Modules --- */}
            <Text className="text-lg font-bold text-stone-900 mb-3">
              Modules ({draft.modules.length})
            </Text>

            {draft.modules.map((mod, mi) => (
              <Card key={mi} className="mb-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                    <Text className="text-primary-600 text-sm font-bold">{mi + 1}</Text>
                  </View>
                  <TextInput
                    value={mod.title}
                    onChangeText={(v) => updateModuleTitle(mi, v)}
                    className="flex-1 text-base font-semibold text-stone-800 border-b border-surface-200 pb-1"
                    placeholder="Module title"
                    placeholderTextColor="#a8a29e"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Remove Module?', `Delete "${mod.title}" and all its lessons?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => removeModule(mi) },
                      ])
                    }
                  >
                    <Text className="text-error-500 text-xs font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* Lessons list */}
                {mod.lessons.length > 0 && (
                  <View className="ml-4 gap-2 mb-3">
                    {mod.lessons.map((lesson, li) => (
                      <TouchableOpacity
                        key={li}
                        onPress={() =>
                          setLessonModal({
                            visible: true,
                            moduleIndex: mi,
                            lessonIndex: li,
                            initial: lesson,
                          })
                        }
                        className="flex-row items-center gap-3 bg-surface-50 rounded-xl p-3 border border-surface-200"
                      >
                        <View className="w-7 h-7 rounded-lg bg-white items-center justify-center border border-surface-200">
                          <Text className="text-stone-500 text-xs">
                            {LESSON_TYPE_ICONS[lesson.type] ?? '\u2261'}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-stone-800">
                            {mi + 1}.{li + 1} {lesson.title}
                          </Text>
                          <Text className="text-xs text-stone-400 capitalize mt-0.5">
                            {lesson.type}
                            {lesson.duration_estimate_min
                              ? ` \u00B7 ${lesson.duration_estimate_min} min`
                              : ''}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert('Remove Lesson?', `Delete "${lesson.title}"?`, [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => removeLesson(mi, li),
                              },
                            ])
                          }
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text className="text-error-400 text-xs">X</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() =>
                    setLessonModal({ visible: true, moduleIndex: mi })
                  }
                  className="py-2"
                >
                  <Text className="text-primary-600 text-sm font-semibold text-center">
                    + Add Lesson
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}

            {/* Add module */}
            <Card className="mb-6">
              <Text className="text-sm font-semibold text-stone-700 mb-2">New Module</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={newModuleTitle}
                  onChangeText={setNewModuleTitle}
                  placeholder="Module title"
                  className="flex-1 border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900"
                  placeholderTextColor="#a8a29e"
                  onSubmitEditing={handleAddModule}
                  returnKeyType="done"
                />
                <Button
                  title="Add"
                  onPress={handleAddModule}
                  variant="outline"
                  size="md"
                  disabled={!newModuleTitle.trim()}
                />
              </View>
            </Card>

            {/* Summary + Publish */}
            <Card className="mb-4">
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-stone-500">Modules</Text>
                <Text className="text-sm font-semibold text-stone-800">
                  {draft.modules.length}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-stone-500">Total Lessons</Text>
                <Text className="text-sm font-semibold text-stone-800">{totalLessons}</Text>
              </View>
              <View className="flex-row justify-between mb-5">
                <Text className="text-sm text-stone-500">Level</Text>
                <Text className="text-sm font-semibold text-stone-800 capitalize">
                  {draft.level}
                </Text>
              </View>
              <Button
                title="Save to Supabase"
                onPress={handlePublish}
                variant="primary"
                size="lg"
                fullWidth
                loading={saveMutation.isPending}
                disabled={!draft.title.trim() || draft.modules.length === 0}
              />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Lesson editor modal */}
      <LessonEditorModal
        visible={lessonModal.visible}
        onClose={() => setLessonModal({ visible: false, moduleIndex: 0 })}
        onSave={handleSaveLesson}
        initial={lessonModal.initial}
      />
    </SafeAreaView>
  );
}
