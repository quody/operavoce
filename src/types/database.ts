export type VoiceType = 'soprano' | 'mezzo_soprano' | 'contralto' | 'tenor' | 'baritone' | 'bass';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SubscriptionTier = 'free' | 'premium' | 'lifetime';
export type ProgramStatus = 'active' | 'completed' | 'paused' | 'abandoned';
export type SessionStatus = 'upcoming' | 'completed' | 'skipped';
export type LessonType = 'text' | 'exercise' | 'audio' | 'quiz' | 'video';
export type GoalType = 'duration' | 'exercise' | 'custom';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  voice_type: VoiceType | null;
  experience_level: ExperienceLevel | null;
  practice_days_per_week: number;
  preferred_practice_time: string;
  timezone: string;
  streak_current: number;
  streak_longest: number;
  total_practice_minutes: number;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string | null;
  level: ExperienceLevel | null;
  duration_weeks: number | null;
  thumbnail_url: string | null;
  is_free: boolean;
  sort_order: number;
  created_at: string;
}

export interface Module {
  id: string;
  program_id: string;
  title: string;
  sort_order: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: LessonType;
  content: LessonContent;
  audio_url: string | null;
  video_url: string | null;
  duration_estimate_min: number | null;
  sort_order: number;
}

export interface LessonContent {
  body?: string;
  images?: string[];
  exercise?: ExerciseConfig;
  quiz?: QuizConfig;
}

export interface ExerciseConfig {
  instructions: string;
  duration_seconds?: number;
  reps?: number;
  bpm?: number;
  use_metronome?: boolean;
}

export interface QuizConfig {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface UserProgram {
  id: string;
  user_id: string;
  program_id: string;
  status: ProgramStatus;
  start_date: string;
  target_end_date: string | null;
  current_module_id: string | null;
  current_lesson_id: string | null;
  percent_complete: number;
  created_at: string;
  updated_at: string;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: SessionStatus;
  user_program_id: string | null;
  linked_lesson_ids: string[];
  actual_duration_min: number | null;
  self_rating: number | null;
  journal_note: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SessionGoal {
  id: string;
  session_id: string;
  type: GoalType;
  description: string | null;
  target_value: string | null;
  actual_value: string | null;
  met: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  daily_reminder_enabled: boolean;
  daily_reminder_offset_min: number;
  streak_reminder_enabled: boolean;
  streak_reminder_time: string;
  weekly_summary_enabled: boolean;
  weekly_summary_day: number;
  weekly_summary_time: string;
  milestone_notifications: boolean;
  expo_push_token: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      programs: {
        Row: Program;
        Insert: Partial<Program>;
        Update: Partial<Program>;
      };
      modules: {
        Row: Module;
        Insert: Partial<Module>;
        Update: Partial<Module>;
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson>;
        Update: Partial<Lesson>;
      };
      user_programs: {
        Row: UserProgram;
        Insert: Partial<UserProgram> & { user_id: string; program_id: string };
        Update: Partial<UserProgram>;
      };
      lesson_completions: {
        Row: LessonCompletion;
        Insert: Partial<LessonCompletion> & { user_id: string; lesson_id: string };
        Update: Partial<LessonCompletion>;
      };
      sessions: {
        Row: Session;
        Insert: Partial<Session> & { user_id: string; scheduled_date: string };
        Update: Partial<Session>;
      };
      session_goals: {
        Row: SessionGoal;
        Insert: Partial<SessionGoal> & { session_id: string };
        Update: Partial<SessionGoal>;
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Partial<NotificationPreferences> & { user_id: string };
        Update: Partial<NotificationPreferences>;
      };
    };
  };
}
