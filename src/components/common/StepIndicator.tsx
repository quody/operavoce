import React from 'react';
import { View } from 'react-native';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row gap-2 px-8 pt-4 pb-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          className={`flex-1 h-1 rounded-full ${
            i < currentStep ? 'bg-accent-400' : i === currentStep ? 'bg-primary-400' : 'bg-white/20'
          }`}
        />
      ))}
    </View>
  );
}
