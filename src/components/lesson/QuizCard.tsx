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
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</Text>
        <Text className="text-4xl font-bold text-primary-500 mb-2">
          {correctCount}/{totalQuestions}
        </Text>
        <Text className="text-gray-600 mb-6">
          {correctCount === totalQuestions
            ? 'Perfect score!'
            : correctCount >= totalQuestions / 2
              ? 'Good job! Keep practicing.'
              : 'Keep studying, you\'ll get there!'}
        </Text>
        <TouchableOpacity onPress={onComplete} className="px-8 py-3 rounded-xl bg-primary-500">
          <Text className="text-white font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-sm text-gray-400 mb-2">
          Question {currentQuestion + 1} of {totalQuestions}
        </Text>
        <Text className="text-lg font-semibold text-gray-900 mb-6">{question.question}</Text>

        <View className="gap-3 mb-4">
          {question.options.map((option, index) => {
            let optionStyle = 'border-2 border-gray-200 bg-gray-50';
            let textStyle = 'text-gray-700';

            if (selectedAnswer !== null) {
              if (index === question.correct_index) {
                optionStyle = 'border-2 border-green-500 bg-green-50';
                textStyle = 'text-green-700';
              } else if (index === selectedAnswer && !isCorrect) {
                optionStyle = 'border-2 border-red-500 bg-red-50';
                textStyle = 'text-red-700';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-xl ${optionStyle}`}
              >
                <Text className={`text-base font-medium ${textStyle}`}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && question.explanation && (
          <View className="bg-blue-50 p-4 rounded-xl mb-4">
            <Text className="text-sm text-blue-800">{question.explanation}</Text>
          </View>
        )}

        {selectedAnswer !== null && (
          <TouchableOpacity onPress={handleNext} className="px-6 py-3 rounded-xl bg-primary-500 self-end">
            <Text className="text-white font-semibold">
              {currentQuestion < totalQuestions - 1 ? 'Next' : 'Finish'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
