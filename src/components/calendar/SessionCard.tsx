import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Session } from '@/types/database';
import { formatTime } from '@/utils/datetime';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  programTitle?: string;
}

export function SessionCard({ session, onPress, programTitle }: SessionCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 border-blue-300',
    completed: 'bg-green-100 border-green-300',
    skipped: 'bg-gray-100 border-gray-300',
  };

  const statusTextColors = {
    upcoming: 'text-blue-700',
    completed: 'text-green-700',
    skipped: 'text-gray-500',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    completed: 'Completed',
    skipped: 'Skipped',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-xl p-4 border ${statusColors[session.status]} mb-3`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {programTitle ?? 'Free Practice'}
          </Text>
          {session.scheduled_time && (
            <Text className="text-sm text-gray-500 mt-1">
              {formatTime(session.scheduled_time)}
            </Text>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${statusColors[session.status]}`}>
          <Text className={`text-xs font-medium ${statusTextColors[session.status]}`}>
            {statusLabels[session.status]}
          </Text>
        </View>
      </View>

      {session.status === 'completed' && (
        <View className="flex-row gap-4 mt-2">
          {session.actual_duration_min && (
            <Text className="text-sm text-gray-600">{session.actual_duration_min} min</Text>
          )}
          {session.self_rating && (
            <Text className="text-sm text-gray-600">
              {'*'.repeat(session.self_rating)}{'*'.repeat(0)}
            </Text>
          )}
        </View>
      )}

      {session.linked_lesson_ids.length > 0 && (
        <Text className="text-xs text-gray-400 mt-2">
          {session.linked_lesson_ids.length} lesson{session.linked_lesson_ids.length > 1 ? 's' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}
