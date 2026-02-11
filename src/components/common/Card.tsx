import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padded?: boolean;
}

export function Card({ children, onPress, className = '', padded = true }: CardProps) {
  const baseStyle = `bg-white rounded-2xl shadow-sm border border-gray-100 ${padded ? 'p-4' : ''} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={baseStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
