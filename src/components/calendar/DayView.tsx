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
    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold text-stone-900 mb-5 mt-2">
        {formatRelativeDate(day.date)}
      </Text>

      {day.sessions.length === 0 ? (
        <View className="items-center py-16">
          <View className="w-16 h-16 rounded-full bg-surface-100 items-center justify-center mb-4">
            <Text className="text-stone-400 text-2xl">{'\u25A3'}</Text>
          </View>
          <Text className="text-stone-500 text-base font-medium mb-1">No sessions scheduled</Text>
          <Text className="text-stone-400 text-sm">Enroll in a program or tap + above</Text>
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
