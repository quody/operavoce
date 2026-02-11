import { create } from 'zustand';
import { Lesson, SessionGoal } from '@/types/database';

interface ActiveSession {
  sessionId: string;
  currentLessonIndex: number;
  lessons: Lesson[];
  goals: SessionGoal[];
  startedAt: Date;
  elapsedSeconds: number;
  completedLessonIds: string[];
}

interface SessionStore {
  activeSession: ActiveSession | null;
  isTimerRunning: boolean;
  startSession: (sessionId: string, lessons: Lesson[], goals: SessionGoal[]) => void;
  completeLesson: (lessonId: string) => void;
  nextLesson: () => void;
  previousLesson: () => void;
  setTimerRunning: (running: boolean) => void;
  updateElapsed: (seconds: number) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeSession: null,
  isTimerRunning: false,

  startSession: (sessionId, lessons, goals) =>
    set({
      activeSession: {
        sessionId,
        currentLessonIndex: 0,
        lessons,
        goals,
        startedAt: new Date(),
        elapsedSeconds: 0,
        completedLessonIds: [],
      },
      isTimerRunning: true,
    }),

  completeLesson: (lessonId) =>
    set((state) => {
      if (!state.activeSession) return state;
      const completed = new Set(state.activeSession.completedLessonIds);
      completed.add(lessonId);
      return {
        activeSession: {
          ...state.activeSession,
          completedLessonIds: Array.from(completed),
        },
      };
    }),

  nextLesson: () =>
    set((state) => {
      if (!state.activeSession) return state;
      const nextIndex = Math.min(
        state.activeSession.currentLessonIndex + 1,
        state.activeSession.lessons.length - 1
      );
      return {
        activeSession: { ...state.activeSession, currentLessonIndex: nextIndex },
      };
    }),

  previousLesson: () =>
    set((state) => {
      if (!state.activeSession) return state;
      const prevIndex = Math.max(state.activeSession.currentLessonIndex - 1, 0);
      return {
        activeSession: { ...state.activeSession, currentLessonIndex: prevIndex },
      };
    }),

  setTimerRunning: (running) => set({ isTimerRunning: running }),

  updateElapsed: (seconds) =>
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: { ...state.activeSession, elapsedSeconds: seconds },
      };
    }),

  endSession: () => set({ activeSession: null, isTimerRunning: false }),
}));
