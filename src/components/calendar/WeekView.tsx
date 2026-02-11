import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDay } from '@/types/domain';
import { SessionCard } from './SessionCard';
import { isToday } from '@/utils/datetime';

interface WeekViewProps {
  days: CalendarDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekView({ days, selectedDate, onSelectDate }: WeekViewProps) {
  const router = useRouter();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex-row px-3 py-3">
        {days.map((day, index) => {
          const date = new Date(day.date + 'T00:00:00');
          const dayNum = date.getDate();
          const isSelected = day.date === selectedDate;
          const today = isToday(day.date);

          return (
            <TouchableOpacity
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              className={`flex-1 items-center py-3 mx-0.5 rounded-2xl ${
                isSelected ? 'bg-primary-600' : today ? 'bg-primary-50' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  isSelected ? 'text-white/70' : 'text-stone-500'
                }`}
              >
                {dayNames[index]}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? 'text-white' : today ? 'text-primary-600' : 'text-stone-900'
                }`}
              >
                {dayNum}
              </Text>
              <View className="flex-row gap-1 mt-1.5">
                {day.hasCompleted && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-300' : 'bg-success-500'}`} />
                )}
                {day.hasUpcoming && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-500'}`} />
                )}
                {day.hasSkipped && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-stone-300' : 'bg-stone-400'}`} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day details */}
      {days.filter((d) => d.date === selectedDate).map((day) => (
        <View key={day.date} className="px-5 pt-4">
          {day.sessions.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-stone-400 text-sm">No sessions on this day</Text>
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
        </View>
      ))}
    </ScrollView>
  );
}
