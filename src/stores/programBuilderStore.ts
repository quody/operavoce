import { create } from 'zustand';
import { ExperienceLevel, LessonType, LessonContent } from '@/types/database';
import type { ProgramDraft, ModuleDraft, LessonDraft } from '@/services/supabaseProgramService';

interface ProgramBuilderState {
  // --- Draft data ---
  draft: ProgramDraft;

  // --- Draft management ---
  resetDraft: () => void;
  loadDraft: (draft: ProgramDraft) => void;

  // --- Program-level setters ---
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setLevel: (level: ExperienceLevel) => void;
  setDurationWeeks: (weeks: number | null) => void;
  setIsFree: (isFree: boolean) => void;

  // --- Module operations ---
  addModule: (title: string) => void;
  updateModuleTitle: (moduleIndex: number, title: string) => void;
  removeModule: (moduleIndex: number) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  // --- Lesson operations ---
  addLesson: (moduleIndex: number, lesson: LessonDraft) => void;
  updateLesson: (moduleIndex: number, lessonIndex: number, lesson: Partial<LessonDraft>) => void;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
}

const emptyDraft: ProgramDraft = {
  title: '',
  description: '',
  level: 'beginner',
  duration_weeks: null,
  is_free: true,
  modules: [],
};

export const useProgramBuilderStore = create<ProgramBuilderState>((set) => ({
  draft: { ...emptyDraft, modules: [] },

  resetDraft: () => set({ draft: { ...emptyDraft, modules: [] } }),

  loadDraft: (draft) => set({ draft }),

  setTitle: (title) =>
    set((s) => ({ draft: { ...s.draft, title } })),

  setDescription: (description) =>
    set((s) => ({ draft: { ...s.draft, description } })),

  setLevel: (level) =>
    set((s) => ({ draft: { ...s.draft, level } })),

  setDurationWeeks: (weeks) =>
    set((s) => ({ draft: { ...s.draft, duration_weeks: weeks } })),

  setIsFree: (isFree) =>
    set((s) => ({ draft: { ...s.draft, is_free: isFree } })),

  addModule: (title) =>
    set((s) => ({
      draft: {
        ...s.draft,
        modules: [...s.draft.modules, { title, lessons: [] }],
      },
    })),

  updateModuleTitle: (moduleIndex, title) =>
    set((s) => {
      const modules = [...s.draft.modules];
      modules[moduleIndex] = { ...modules[moduleIndex], title };
      return { draft: { ...s.draft, modules } };
    }),

  removeModule: (moduleIndex) =>
    set((s) => ({
      draft: {
        ...s.draft,
        modules: s.draft.modules.filter((_, i) => i !== moduleIndex),
      },
    })),

  reorderModules: (fromIndex, toIndex) =>
    set((s) => {
      const modules = [...s.draft.modules];
      const [removed] = modules.splice(fromIndex, 1);
      modules.splice(toIndex, 0, removed);
      return { draft: { ...s.draft, modules } };
    }),

  addLesson: (moduleIndex, lesson) =>
    set((s) => {
      const modules = [...s.draft.modules];
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: [...modules[moduleIndex].lessons, lesson],
      };
      return { draft: { ...s.draft, modules } };
    }),

  updateLesson: (moduleIndex, lessonIndex, updates) =>
    set((s) => {
      const modules = [...s.draft.modules];
      const lessons = [...modules[moduleIndex].lessons];
      lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates };
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
      return { draft: { ...s.draft, modules } };
    }),

  removeLesson: (moduleIndex, lessonIndex) =>
    set((s) => {
      const modules = [...s.draft.modules];
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex),
      };
      return { draft: { ...s.draft, modules } };
    }),
}));
