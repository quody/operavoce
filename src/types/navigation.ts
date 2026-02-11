export type RootParamList = {
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'session/[sessionId]': { sessionId: string };
};

export type OnboardingParamList = {
  welcome: undefined;
  login: undefined;
  'voice-type': undefined;
  experience: undefined;
  goals: undefined;
  schedule: undefined;
  notifications: undefined;
};

export type TabParamList = {
  index: undefined;
  'programs/index': undefined;
  'programs/[programId]': { programId: string };
  'programs/lesson/[lessonId]': { lessonId: string };
  'calendar/index': undefined;
  'calendar/session/[sessionId]': { sessionId: string };
  'progress/index': undefined;
  'progress/journal': undefined;
  'profile/index': undefined;
  'profile/notifications': undefined;
  'profile/account': undefined;
};
