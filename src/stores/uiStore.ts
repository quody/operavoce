import { create } from 'zustand';
import { CalendarViewMode } from '@/types/domain';

interface UIStore {
  calendarView: CalendarViewMode;
  selectedDate: string;
  isOnboardingComplete: boolean;
  setCalendarView: (view: CalendarViewMode) => void;
  setSelectedDate: (date: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
}

const today = new Date().toISOString().split('T')[0];

export const useUIStore = create<UIStore>((set) => ({
  calendarView: 'week',
  selectedDate: today,
  isOnboardingComplete: false,
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
}));
