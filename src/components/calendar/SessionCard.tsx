import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Session } from '@/types/database';
import { formatTime } from '@/utils/datetime';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  programTitle?: string;
}

const STATUS_CONFIG = {
  upcoming: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-700',
    label: 'Upcoming',
  },
  completed: {
    bg: 'bg-success-50',
    border: 'border-green-200',
    badge: 'bg-success-100',
    badgeText: 'text-success-600',
    label: 'Completed',
  },
  skipped: {
    bg: 'bg-surface-50',
    border: 'border-surface-200',
    badge: 'bg-surface-100',
    badgeText: 'text-stone-500',
    label: 'Skipped',
  },
};

export function SessionCard({ session, onPress, programTitle }: SessionCardProps) {
  const config = STATUS_CONFIG[session.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-2xl p-4 border ${config.bg} ${config.border} mb-3`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-stone-900">
            {programTitle ?? 'Free Practice'}
          </Text>
          {session.scheduled_time && (
            <Text className="text-sm text-stone-500 mt-0.5">
              {formatTime(session.scheduled_time)}
            </Text>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${config.badge}`}>
          <Text className={`text-xs font-semibold ${config.badgeText}`}>
            {config.label}
          </Text>
        </View>
      </View>

      {session.status === 'completed' && (
        <View className="flex-row gap-4 mt-1">
          {session.actual_duration_min && (
            <Text className="text-sm text-stone-600">{session.actual_duration_min} min</Text>
          )}
          {session.self_rating && (
            <Text className="text-sm text-accent-500">
              {'\u2605'.repeat(session.self_rating)}{'\u2606'.repeat(5 - session.self_rating)}
            </Text>
          )}
        </View>
      )}

      {session.linked_lesson_ids.length > 0 && (
        <Text className="text-xs text-stone-400 mt-2">
          {session.linked_lesson_ids.length} lesson{session.linked_lesson_ids.length > 1 ? 's' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}
