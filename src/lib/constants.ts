export const APP_NAME = 'OperaVoce';
export const APP_SCHEME = 'com.operavoce.app';

export const VOICE_TYPES = [
  { value: 'soprano', label: 'Soprano' },
  { value: 'mezzo_soprano', label: 'Mezzo-Soprano' },
  { value: 'contralto', label: 'Contralto' },
  { value: 'tenor', label: 'Tenor' },
  { value: 'baritone', label: 'Baritone' },
  { value: 'bass', label: 'Bass' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to opera singing' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some training or choir experience' },
  { value: 'advanced', label: 'Advanced', description: 'Preparing for auditions or performances' },
] as const;

export const GOAL_OPTIONS = [
  { value: 'learn_basics', label: 'Learn the basics' },
  { value: 'improve_technique', label: 'Improve technique' },
  { value: 'prepare_audition', label: 'Prepare for an audition' },
  { value: 'general_practice', label: 'General practice' },
] as const;

export const PRACTICE_DAYS_OPTIONS = [3, 4, 5, 6, 7] as const;

export const PRACTICE_TIME_OPTIONS = [
  { value: '06:00', label: 'Early morning (6 AM)' },
  { value: '09:00', label: 'Morning (9 AM)' },
  { value: '12:00', label: 'Midday (12 PM)' },
  { value: '15:00', label: 'Afternoon (3 PM)' },
  { value: '18:00', label: 'Evening (6 PM)' },
  { value: '20:00', label: 'Night (8 PM)' },
] as const;

export const RATING_LABELS = ['Struggled', 'Below average', 'Average', 'Good', 'Excellent'] as const;

export const COLORS = {
  primary: '#4a3f8f',
  primaryLight: '#6b6bff',
  primaryDark: '#1a1a2e',
  accent: '#f97316',
  accentLight: '#fdba74',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  muted: '#9ca3af',
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export const PROGRAM_MILESTONES = [25, 50, 75, 100] as const;
