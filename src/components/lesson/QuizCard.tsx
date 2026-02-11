import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { QuizConfig } from '@/types/database';

interface QuizCardProps {
  config: QuizConfig;
  onComplete: () => void;
}

export function QuizCard({ config, onComplete }: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = config.questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correct_index;
  const totalQuestions = config.questions.length;

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === question.correct_index) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <View className="bg-white rounded-3xl p-6 border border-surface-200 items-center">
        <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
          <Text className="text-primary-600 text-2xl">{'\u2713'}</Text>
        </View>
        <Text className="text-2xl font-bold text-stone-900 mb-2">Quiz Complete!</Text>
        <Text className="text-4xl font-bold text-primary-600 mb-2">
          {correctCount}/{totalQuestions}
        </Text>
        <Text className="text-stone-600 mb-6">
          {correctCount === totalQuestions
            ? 'Perfect score!'
            : correctCount >= totalQuestions / 2
              ? 'Good job! Keep practicing.'
              : 'Keep studying, you\'ll get there!'}
        </Text>
        <TouchableOpacity onPress={onComplete} className="px-8 py-3.5 rounded-2xl bg-primary-600">
          <Text className="text-white font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="bg-white rounded-3xl p-6 border border-surface-200">
        <Text className="text-sm text-stone-400 mb-3 font-medium">
          Question {currentQuestion + 1} of {totalQuestions}
        </Text>
        <Text className="text-lg font-semibold text-stone-900 mb-6">{question.question}</Text>

        <View className="gap-3 mb-4">
          {question.options.map((option, index) => {
            let optionStyle = 'border-2 border-surface-200 bg-surface-50';
            let textStyle = 'text-stone-700';

            if (selectedAnswer !== null) {
              if (index === question.correct_index) {
                optionStyle = 'border-2 border-success-500 bg-success-50';
                textStyle = 'text-success-600';
              } else if (index === selectedAnswer && !isCorrect) {
                optionStyle = 'border-2 border-error-500 bg-error-50';
                textStyle = 'text-error-500';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-2xl ${optionStyle}`}
              >
                <Text className={`text-base font-medium ${textStyle}`}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && question.explanation && (
          <View className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-200">
            <Text className="text-sm text-blue-800">{question.explanation}</Text>
          </View>
        )}

        {selectedAnswer !== null && (
          <TouchableOpacity onPress={handleNext} className="px-6 py-3 rounded-2xl bg-primary-600 self-end">
            <Text className="text-white font-semibold">
              {currentQuestion < totalQuestions - 1 ? 'Next' : 'Finish'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
