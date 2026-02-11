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

export const RATING_LABELS = ['Struggled', 'Below average', 'Average', 'Good', 'Excellent'] as const;

export const COLORS = {
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  primaryDark: '#2e1065',
  accent: '#f59e0b',
  accentLight: '#fcd34d',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  background: '#fafaf9',
  surface: '#ffffff',
  text: '#1c1917',
  textSecondary: '#78716c',
  border: '#e7e5e4',
  muted: '#a8a29e',
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export const PROGRAM_MILESTONES = [25, 50, 75, 100] as const;
