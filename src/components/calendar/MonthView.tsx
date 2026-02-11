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

  // Pad days to start on correct day of week
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const paddedDays: (CalendarDay | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  // Fill remaining cells
  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <View className="px-4">
      <Text className="text-xl font-bold text-gray-900 text-center mb-4">
        {monthNames[month]} {year}
      </Text>

      {/* Day headers */}
      <View className="flex-row mb-2">
        {dayNames.map((name, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs text-gray-400 font-medium">{name}</Text>
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
            if (isSelected) bgColor = 'bg-primary-500';
            else if (day.hasCompleted) bgColor = 'bg-green-100';
            else if (today) bgColor = 'bg-primary-50';

            return (
              <TouchableOpacity
                key={day.date}
                onPress={() => onSelectDate(day.date)}
                className={`flex-1 aspect-square items-center justify-center rounded-lg ${bgColor}`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? 'text-white font-bold' :
                    today ? 'text-primary-500 font-bold' :
                    'text-gray-700'
                  }`}
                >
                  {dayNum}
                </Text>
                {(day.hasCompleted || day.hasUpcoming) && !isSelected && (
                  <View className="flex-row gap-0.5 mt-0.5">
                    {day.hasCompleted && <View className="w-1 h-1 rounded-full bg-green-500" />}
                    {day.hasUpcoming && <View className="w-1 h-1 rounded-full bg-blue-500" />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
