import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDay } from '@/types/domain';
import { isToday } from '@/utils/datetime';

interface MonthViewProps {
  days: CalendarDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  year: number;
  month: number;
}

export function MonthView({ days, selectedDate, onSelectDate, year, month }: MonthViewProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const paddedDays: (CalendarDay | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const totalSessions = days.reduce((sum, d) => sum + d.sessions.length, 0);
  const upcomingSessions = days.reduce((sum, d) => sum + d.sessions.filter(s => s.status === 'upcoming').length, 0);
  const completedSessions = days.reduce((sum, d) => sum + d.sessions.filter(s => s.status === 'completed').length, 0);

  return (
    <View className="px-5">
      <Text className="text-xl font-bold text-stone-900 text-center mb-5">
        {monthNames[month]} {year}
      </Text>

      {/* Day headers */}
      <View className="flex-row mb-3">
        {dayNames.map((name, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs text-stone-400 font-semibold">{name}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row mb-1">
          {week.map((day, dayIndex) => {
            if (!day) {
              return <View key={`empty-${dayIndex}`} className="flex-1 aspect-square" />;
            }

            const date = new Date(day.date + 'T00:00:00');
            const dayNum = date.getDate();
            const isSelected = day.date === selectedDate;
            const today = isToday(day.date);

            let bgColor = 'bg-transparent';
            if (isSelected) bgColor = 'bg-primary-600';
            else if (day.hasCompleted) bgColor = 'bg-success-50';
            else if (today) bgColor = 'bg-primary-50';

            return (
              <TouchableOpacity
                key={day.date}
                onPress={() => onSelectDate(day.date)}
                className={`flex-1 aspect-square items-center justify-center rounded-xl ${bgColor}`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? 'text-white font-bold' :
                    today ? 'text-primary-600 font-bold' :
                    'text-stone-700'
                  }`}
                >
                  {dayNum}
                </Text>
                {(day.hasCompleted || day.hasUpcoming) && !isSelected && (
                  <View className="flex-row gap-0.5 mt-0.5">
                    {day.hasCompleted && <View className="w-1 h-1 rounded-full bg-success-500" />}
                    {day.hasUpcoming && <View className="w-1 h-1 rounded-full bg-blue-500" />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Session summary */}
      {totalSessions > 0 && (
        <View className="mt-5 bg-surface-100 rounded-2xl p-4 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-stone-700">
            {totalSessions} session{totalSessions !== 1 ? 's' : ''} scheduled
          </Text>
          <View className="flex-row gap-3">
            {completedSessions > 0 && (
              <Text className="text-xs text-success-600 font-medium">{completedSessions} done</Text>
            )}
            {upcomingSessions > 0 && (
              <Text className="text-xs text-blue-600 font-medium">{upcomingSessions} upcoming</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
