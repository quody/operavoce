import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { hasCompletedOnboarding } from '@/services/authService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Index() {
  const { state } = useAuthStore();
  const { isOnboardingComplete, setOnboardingComplete } = useUIStore();

  useEffect(() => {
    hasCompletedOnboarding().then(setOnboardingComplete);
  }, [state, setOnboardingComplete]);

  if (state === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  if (!isOnboardingComplete && state === 'unauthenticated') {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
