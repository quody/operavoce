import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarDay } from '@/types/domain';
import { isToday } from '@/utils/datetime';

interface WeekViewProps {
  days: CalendarDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekView({ days, selectedDate, onSelectDate }: WeekViewProps) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex-row px-2 py-3">
        {days.map((day, index) => {
          const date = new Date(day.date + 'T00:00:00');
          const dayNum = date.getDate();
          const isSelected = day.date === selectedDate;
          const today = isToday(day.date);

          return (
            <TouchableOpacity
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              className={`flex-1 items-center py-3 mx-0.5 rounded-xl ${
                isSelected ? 'bg-primary-500' : today ? 'bg-primary-50' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs mb-1 ${
                  isSelected ? 'text-white' : 'text-gray-500'
                }`}
              >
                {dayNames[index]}
              </Text>
              <Text
                className={`text-lg font-semibold ${
                  isSelected ? 'text-white' : today ? 'text-primary-500' : 'text-gray-900'
                }`}
              >
                {dayNum}
              </Text>
              <View className="flex-row gap-1 mt-1">
                {day.hasCompleted && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-300' : 'bg-green-500'}`} />
                )}
                {day.hasUpcoming && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-500'}`} />
                )}
                {day.hasSkipped && (
                  <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-gray-300' : 'bg-gray-400'}`} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day details */}
      {days.filter((d) => d.date === selectedDate).map((day) => (
        <View key={day.date} className="px-4 pt-4">
          {day.sessions.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-400">No sessions on this day</Text>
            </View>
          ) : (
            day.sessions.map((session) => (
              <View key={session.id} className={`rounded-xl p-3 mb-2 ${
                session.status === 'completed' ? 'bg-green-50' :
                session.status === 'upcoming' ? 'bg-blue-50' : 'bg-gray-50'
              }`}>
                <Text className="text-sm font-medium text-gray-900">
                  {session.scheduled_time ? session.scheduled_time : 'Practice Session'}
                </Text>
                <Text className="text-xs text-gray-500 capitalize">{session.status}</Text>
              </View>
            ))
          )}
        </View>
      ))}
    </ScrollView>
  );
}
