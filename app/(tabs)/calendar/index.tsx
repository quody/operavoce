import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUIStore } from '@/stores/uiStore';
import { useCalendarData } from '@/hooks/useCalendar';
import { useCreateSession } from '@/hooks/useSessions';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CalendarViewMode } from '@/types/domain';
import { addDays } from '@/utils/datetime';

export default function CalendarScreen() {
  const { calendarView, selectedDate, setCalendarView, setSelectedDate } = useUIStore();
  const { calendarDays, isLoading } = useCalendarData(calendarView, selectedDate);
  const createSession = useCreateSession();

  const views: CalendarViewMode[] = ['day', 'week', 'month'];

  const handleAddSession = async () => {
    try {
      await createSession.mutateAsync({
        scheduled_date: selectedDate,
        scheduled_time: '18:00',
      });
    } catch {
      Alert.alert('Error', 'Failed to create session.');
    }
  };

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
    <SafeAreaView className="flex-1 bg-surface-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-stone-900">Calendar</Text>
        <TouchableOpacity
          onPress={handleAddSession}
          className="w-10 h-10 rounded-full bg-primary-600 items-center justify-center"
        >
          <Text className="text-white text-2xl font-light" style={{ marginTop: -2 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* View Switcher */}
      <View className="flex-row px-5 mb-4">
        <View className="flex-row flex-1 bg-surface-100 rounded-2xl p-1">
          {views.map((view) => (
            <TouchableOpacity
              key={view}
              onPress={() => setCalendarView(view)}
              className={`flex-1 py-2.5 items-center rounded-xl ${
                calendarView === view ? 'bg-white' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  calendarView === view ? 'text-primary-600' : 'text-stone-500'
                }`}
              >
                {view}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <TouchableOpacity onPress={() => navigateDate(-1)} className="px-3 py-2">
          <Text className="text-primary-600 text-base font-medium">{'\u2039'} Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="px-5 py-1.5 bg-primary-50 rounded-full"
        >
          <Text className="text-primary-600 font-semibold text-sm">Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDate(1)} className="px-3 py-2">
          <Text className="text-primary-600 text-base font-medium">Next {'\u203A'}</Text>
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
