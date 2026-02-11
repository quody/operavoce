import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Index() {
  const { state } = useAuthStore();
  const { isOnboardingComplete } = useUIStore();

  if (state === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  if (!isOnboardingComplete && state === 'unauthenticated') {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
