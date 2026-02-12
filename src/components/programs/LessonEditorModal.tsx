import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { LessonType, LessonContent, ExerciseConfig, QuizQuestion } from '@/types/database';
import type { LessonDraft } from '@/services/supabaseProgramService';

const LESSON_TYPES: { value: LessonType; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: '\u2261' },
  { value: 'exercise', label: 'Exercise', icon: '\u266B' },
  { value: 'quiz', label: 'Quiz', icon: '\u2753' },
  { value: 'audio', label: 'Audio', icon: '\u266A' },
  { value: 'video', label: 'Video', icon: '\u25B6' },
];

interface LessonEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (lesson: LessonDraft) => void;
  initial?: LessonDraft;
}

export function LessonEditorModal({ visible, onClose, onSave, initial }: LessonEditorModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<LessonType>(initial?.type ?? 'text');
  const [durationMin, setDurationMin] = useState(
    initial?.duration_estimate_min?.toString() ?? '',
  );
  const [body, setBody] = useState(initial?.content?.body ?? '');

  // Exercise fields
  const [instructions, setInstructions] = useState(
    initial?.content?.exercise?.instructions ?? '',
  );
  const [durationSec, setDurationSec] = useState(
    initial?.content?.exercise?.duration_seconds?.toString() ?? '',
  );
  const [reps, setReps] = useState(
    initial?.content?.exercise?.reps?.toString() ?? '',
  );
  const [bpm, setBpm] = useState(
    initial?.content?.exercise?.bpm?.toString() ?? '',
  );
  const [useMetronome, setUseMetronome] = useState(
    initial?.content?.exercise?.use_metronome ?? false,
  );

  // Quiz fields
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.content?.quiz?.questions ?? [
      { question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' },
    ],
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' },
    ]);
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[qi] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const removeQuestion = (qi: number) => {
    setQuestions(questions.filter((_, i) => i !== qi));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const content: LessonContent = {};

    if (body.trim()) {
      content.body = body.trim();
    }

    if (type === 'exercise' && instructions.trim()) {
      const exercise: ExerciseConfig = { instructions: instructions.trim() };
      if (durationSec) exercise.duration_seconds = parseInt(durationSec, 10);
      if (reps) exercise.reps = parseInt(reps, 10);
      if (bpm) exercise.bpm = parseInt(bpm, 10);
      if (useMetronome) exercise.use_metronome = true;
      content.exercise = exercise;
    }

    if (type === 'quiz' && questions.length > 0) {
      const validQuestions = questions.filter(
        (q) => q.question.trim() && q.options.some((o) => o.trim()),
      );
      if (validQuestions.length > 0) {
        content.quiz = { questions: validQuestions };
      }
    }

    onSave({
      ...(initial?.id ? { id: initial.id } : {}),
      title: title.trim(),
      type,
      content,
      duration_estimate_min: durationMin ? parseInt(durationMin, 10) : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={initial ? 'Edit Lesson' : 'Add Lesson'}>
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[600px]">
        {/* Title */}
        <Text className="text-sm font-semibold text-stone-700 mb-1.5">Lesson Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. The Singer's Stance"
          className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-4"
          placeholderTextColor="#a8a29e"
        />

        {/* Type picker */}
        <Text className="text-sm font-semibold text-stone-700 mb-2">Lesson Type</Text>
        <View className="flex-row gap-2 mb-4 flex-wrap">
          {LESSON_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              onPress={() => setType(lt.value)}
              className={`px-3.5 py-2 rounded-xl border ${
                type === lt.value
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-surface-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  type === lt.value ? 'text-white' : 'text-stone-600'
                }`}
              >
                {lt.icon} {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration */}
        <Text className="text-sm font-semibold text-stone-700 mb-1.5">
          Estimated Duration (min)
        </Text>
        <TextInput
          value={durationMin}
          onChangeText={setDurationMin}
          placeholder="10"
          keyboardType="number-pad"
          className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-4"
          placeholderTextColor="#a8a29e"
        />

        {/* Body / Description (shared across types) */}
        <Text className="text-sm font-semibold text-stone-700 mb-1.5">
          {type === 'text' ? 'Content (Markdown)' : 'Description'}
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={
            type === 'text'
              ? '# Heading\n\nYour lesson content in markdown...'
              : 'Brief description of this lesson'
          }
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-4 min-h-[120px]"
          placeholderTextColor="#a8a29e"
        />

        {/* Exercise-specific fields */}
        {type === 'exercise' && (
          <View className="mb-4">
            <Text className="text-sm font-bold text-stone-800 mb-3">Exercise Configuration</Text>

            <Text className="text-sm font-semibold text-stone-700 mb-1.5">Instructions</Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Step-by-step exercise instructions..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900 mb-3 min-h-[80px]"
              placeholderTextColor="#a8a29e"
            />

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-700 mb-1.5">Duration (sec)</Text>
                <TextInput
                  value={durationSec}
                  onChangeText={setDurationSec}
                  placeholder="120"
                  keyboardType="number-pad"
                  className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900"
                  placeholderTextColor="#a8a29e"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-700 mb-1.5">Reps</Text>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder="3"
                  keyboardType="number-pad"
                  className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900"
                  placeholderTextColor="#a8a29e"
                />
              </View>
            </View>

            <View className="flex-row gap-3 items-end mb-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-700 mb-1.5">BPM</Text>
                <TextInput
                  value={bpm}
                  onChangeText={setBpm}
                  placeholder="60"
                  keyboardType="number-pad"
                  className="border border-surface-200 rounded-xl px-4 py-3 text-base text-stone-900"
                  placeholderTextColor="#a8a29e"
                />
              </View>
              <View className="flex-1 flex-row items-center justify-between border border-surface-200 rounded-xl px-4 py-3">
                <Text className="text-sm text-stone-700">Metronome</Text>
                <Switch
                  value={useMetronome}
                  onValueChange={setUseMetronome}
                  trackColor={{ false: '#d6d3d1', true: '#a78bfa' }}
                  thumbColor={useMetronome ? '#7c3aed' : '#f5f5f4'}
                />
              </View>
            </View>
          </View>
        )}

        {/* Quiz-specific fields */}
        {type === 'quiz' && (
          <View className="mb-4">
            <Text className="text-sm font-bold text-stone-800 mb-3">Quiz Questions</Text>

            {questions.map((q, qi) => (
              <View key={qi} className="bg-surface-50 rounded-xl p-3 mb-3 border border-surface-200">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-semibold text-stone-700">
                    Question {qi + 1}
                  </Text>
                  {questions.length > 1 && (
                    <TouchableOpacity onPress={() => removeQuestion(qi)}>
                      <Text className="text-error-500 text-xs font-medium">Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  value={q.question}
                  onChangeText={(v) => updateQuestion(qi, 'question', v)}
                  placeholder="Your question..."
                  className="border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 bg-white mb-2"
                  placeholderTextColor="#a8a29e"
                />

                {q.options.map((opt, oi) => (
                  <View key={oi} className="flex-row items-center gap-2 mb-1.5">
                    <TouchableOpacity
                      onPress={() => updateQuestion(qi, 'correct_index', oi)}
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        q.correct_index === oi
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-surface-300'
                      }`}
                    >
                      {q.correct_index === oi && (
                        <Text className="text-white text-xs font-bold">{'\u2713'}</Text>
                      )}
                    </TouchableOpacity>
                    <TextInput
                      value={opt}
                      onChangeText={(v) => updateOption(qi, oi, v)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
                      placeholderTextColor="#a8a29e"
                    />
                  </View>
                ))}

                <TextInput
                  value={q.explanation ?? ''}
                  onChangeText={(v) => updateQuestion(qi, 'explanation', v)}
                  placeholder="Explanation (optional)"
                  className="border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 bg-white mt-2"
                  placeholderTextColor="#a8a29e"
                />
              </View>
            ))}

            <TouchableOpacity onPress={addQuestion} className="py-2">
              <Text className="text-primary-600 text-sm font-semibold text-center">
                + Add Question
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save */}
        <Button
          title={initial ? 'Update Lesson' : 'Add Lesson'}
          onPress={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!title.trim()}
        />

        <View className="h-6" />
      </ScrollView>
    </Modal>
  );
}
