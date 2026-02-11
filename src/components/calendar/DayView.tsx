import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CalendarDay } from '@/types/domain';
import { SessionCard } from './SessionCard';
import { formatRelativeDate } from '@/utils/datetime';
import { useRouter } from 'expo-router';

interface DayViewProps {
  day: CalendarDay;
}

export function DayView({ day }: DayViewProps) {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold text-gray-900 mb-4 mt-2">
        {formatRelativeDate(day.date)}
      </Text>

      {day.sessions.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-gray-400 text-lg mb-2">No sessions scheduled</Text>
          <Text className="text-gray-400 text-sm">Tap + to add a practice session</Text>
        </View>
      ) : (
        day.sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => router.push(`/calendar/session/${session.id}`)}
          />
        ))
      )}
    </ScrollView>
  );
}
