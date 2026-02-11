import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '@/stores/uiStore';
import { useCalendarData } from '@/hooks/useCalendar';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CalendarViewMode } from '@/types/domain';
import { addDays } from '@/utils/datetime';

export default function CalendarScreen() {
  const { calendarView, selectedDate, setCalendarView, setSelectedDate } = useUIStore();
  const { calendarDays, isLoading } = useCalendarData(calendarView, selectedDate);

  const views: CalendarViewMode[] = ['day', 'week', 'month'];

  const navigateDate = (direction: number) => {
    if (calendarView === 'day') {
      setSelectedDate(addDays(selectedDate, direction));
    } else if (calendarView === 'week') {
      setSelectedDate(addDays(selectedDate, direction * 7));
    } else {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() + direction);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Calendar</Text>
      </View>

      {/* View Switcher */}
      <View className="flex-row px-4 mb-3">
        {views.map((view) => (
          <TouchableOpacity
            key={view}
            onPress={() => setCalendarView(view)}
            className={`flex-1 py-2 items-center rounded-lg mx-1 ${
              calendarView === view ? 'bg-primary-500' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium capitalize ${
                calendarView === view ? 'text-white' : 'text-gray-600'
              }`}
            >
              {view}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <TouchableOpacity onPress={() => navigateDate(-1)} className="p-2">
          <Text className="text-primary-500 text-lg">&#x2039; Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="px-4 py-1 bg-primary-50 rounded-full"
        >
          <Text className="text-primary-500 font-medium">Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDate(1)} className="p-2">
          <Text className="text-primary-500 text-lg">Next &#x203A;</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <View className="flex-1">
          {calendarView === 'day' && calendarDays.length > 0 && (
            <DayView day={calendarDays[0]} />
          )}
          {calendarView === 'week' && (
            <WeekView
              days={calendarDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
          {calendarView === 'month' && (
            <MonthView
              days={calendarDays}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCalendarView('day');
              }}
              year={parseInt(selectedDate.split('-')[0])}
              month={parseInt(selectedDate.split('-')[1]) - 1}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
