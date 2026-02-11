import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  dark?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  dark = false,
}: ButtonProps) {
  const baseStyle = 'items-center justify-center flex-row';
  const widthStyle = fullWidth ? 'w-full' : '';

  const sizeStyles = {
    sm: 'px-5 py-2.5 rounded-xl',
    md: 'px-6 py-3.5 rounded-2xl',
    lg: 'px-8 py-4 rounded-2xl',
  };

  const variantStyles = {
    primary: 'bg-primary-600',
    secondary: 'bg-accent-500',
    outline: dark ? 'border-2 border-primary-400 bg-transparent' : 'border-2 border-primary-300 bg-transparent',
    ghost: 'bg-transparent',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: dark ? 'text-white' : 'text-primary-600',
    ghost: dark ? 'text-primary-300' : 'text-primary-600',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyle = disabled || loading ? 'opacity-40' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabledStyle}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'secondary' ? '#fff' : '#7c3aed'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`font-semibold tracking-wide ${textStyles[variant]} ${textSizeStyles[size]}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
