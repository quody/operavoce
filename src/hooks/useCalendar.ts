import { useMemo } from 'react';
import { useSessions, useCompletedDates } from './useSessions';
import { CalendarDay } from '@/types/domain';
import { getWeekDates, getMonthDates, getToday } from '@/utils/datetime';

export function useCalendarData(viewMode: 'day' | 'week' | 'month', selectedDate: string) {
  const today = getToday();

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: selectedDate, end: selectedDate };
    }
    if (viewMode === 'week') {
      const dates = getWeekDates(selectedDate);
      return { start: dates[0], end: dates[6] };
    }
    const [year, month] = selectedDate.split('-').map(Number);
    const dates = getMonthDates(year, month - 1);
    return { start: dates[0], end: dates[dates.length - 1] };
  }, [viewMode, selectedDate]);

  const { data: sessions = [], isLoading } = useSessions(dateRange.start, dateRange.end);
  const { data: completedDates = [] } = useCompletedDates();

  const calendarDays = useMemo((): CalendarDay[] => {
    let dates: string[];
    if (viewMode === 'day') {
      dates = [selectedDate];
    } else if (viewMode === 'week') {
      dates = getWeekDates(selectedDate);
    } else {
      const [year, month] = selectedDate.split('-').map(Number);
      dates = getMonthDates(year, month - 1);
    }

    return dates.map((date) => {
      const daySessions = sessions.filter((s) => s.scheduled_date === date);
      return {
        date,
        sessions: daySessions,
        hasCompleted: daySessions.some((s) => s.status === 'completed') || completedDates.includes(date),
        hasUpcoming: daySessions.some((s) => s.status === 'upcoming'),
        hasSkipped: daySessions.some((s) => s.status === 'skipped'),
      };
    });
  }, [viewMode, selectedDate, sessions, completedDates]);

  return { calendarDays, isLoading, today };
}
