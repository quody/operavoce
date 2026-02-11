import { Program, Module, Lesson, Session, SessionGoal, UserProgram } from './database';

export interface ProgramWithModules extends Program {
  modules: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface SessionWithDetails extends Session {
  goals: SessionGoal[];
  lessons: Lesson[];
  program_title?: string;
}

export interface UserProgramWithDetails extends UserProgram {
  program: Program;
  current_module?: Module;
  current_lesson?: Lesson;
}

export interface DashboardStats {
  streak_current: number;
  streak_longest: number;
  total_practice_minutes: number;
  weekly_practice_minutes: number;
  sessions_this_week: number;
  goal_hit_rate: number;
  average_rating: number;
}

export interface JournalEntry {
  session_id: string;
  date: string;
  program_title: string | null;
  exercises_completed: string[];
  self_rating: number | null;
  journal_note: string | null;
  duration_min: number | null;
}

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface CalendarDay {
  date: string;
  sessions: Session[];
  hasCompleted: boolean;
  hasUpcoming: boolean;
  hasSkipped: boolean;
}

export interface OnboardingData {
  voice_type: string | null;
  experience_level: string | null;
  goals: string[];
  practice_days_per_week: number;
  preferred_practice_time: string;
  notifications_enabled: boolean;
}
