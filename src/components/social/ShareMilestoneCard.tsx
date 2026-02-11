import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

interface ShareMilestoneCardProps {
  type: 'streak' | 'program' | 'session';
  value: number;
  label: string;
}

export function ShareMilestoneCard({ type, value, label }: ShareMilestoneCardProps) {
  const viewRef = useRef<View>(null);

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, { format: 'png', quality: 0.9 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `OperaVoce - ${label}`,
        });
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const icons = {
    streak: 'Streak',
    program: 'Complete',
    session: 'Sessions',
  };

  return (
    <View>
      <View ref={viewRef} className="bg-primary-900 rounded-2xl p-6 items-center" collapsable={false}>
        <Text className="text-accent-400 text-sm font-medium mb-1">{icons[type]}</Text>
        <Text className="text-white text-5xl font-bold mb-1">{value}</Text>
        <Text className="text-white text-lg font-medium mb-3">{label}</Text>
        <Text className="text-primary-300 text-xs">OperaVoce</Text>
      </View>

      <TouchableOpacity onPress={handleShare} className="mt-3 bg-primary-500 rounded-xl py-3 items-center">
        <Text className="text-white font-semibold">Share Achievement</Text>
      </TouchableOpacity>
    </View>
  );
}
