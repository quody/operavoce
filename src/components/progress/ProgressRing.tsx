import React from 'react';
import { View, Text } from 'react-native';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  label,
  sublabel,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className="items-center">
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center rounded-full border-4 border-gray-200"
      >
        <View
          className="absolute inset-0 rounded-full border-4 border-primary-500"
          style={{
            width: size,
            height: size,
            opacity: clampedProgress / 100,
          }}
        />
        <Text className="text-2xl font-bold text-primary-500">
          {Math.round(clampedProgress)}%
        </Text>
      </View>
      {label && <Text className="text-sm font-medium text-gray-900 mt-2">{label}</Text>}
      {sublabel && <Text className="text-xs text-gray-500">{sublabel}</Text>}
    </View>
  );
}
