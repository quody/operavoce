import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, size = 'large', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center gap-4">
      <ActivityIndicator size={size} color="#7c3aed" />
      {message && <Text className="text-stone-500 text-sm font-medium">{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View className="flex-1 items-center justify-center bg-surface-50">{content}</View>;
  }

  return <View className="py-8">{content}</View>;
}
