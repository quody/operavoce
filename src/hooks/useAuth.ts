import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { mergeLocalToCloud } from '@/services/mergeManager';
import { setupGuestUser, markOnboardingComplete, hasCompletedOnboarding } from '@/services/authService';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { setAuthState, setUserId } = useAuthStore();

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'com.operavoce.app' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success') {
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          }

          // Check if there's local guest data to merge
          const wasGuest = await AsyncStorage.getItem('auth_mode');
          if (wasGuest === 'guest') {
            await mergeLocalToCloud();
          }

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user?.id) {
            await AsyncStorage.setItem('auth_mode', 'authenticated');
            setUserId(sessionData.session.user.id);
            setAuthState('authenticated');
          }
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, [setAuthState, setUserId]);

  const continueAsGuest = useCallback(async () => {
    const userId = await setupGuestUser();
    setUserId(userId);
    setAuthState('guest');
  }, [setAuthState, setUserId]);

  const initializeAuth = useCallback(async () => {
    try {
      const onboarded = await hasCompletedOnboarding();
      useUIStore.getState().setOnboardingComplete(onboarded);
      if (!onboarded) {
        setAuthState('unauthenticated');
        return;
      }

      const authMode = await AsyncStorage.getItem('auth_mode');
      if (authMode === 'authenticated') {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.id) {
          setUserId(data.session.user.id);
          setAuthState('authenticated');
        } else {
          // Try to refresh
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session?.user?.id) {
            setUserId(refreshData.session.user.id);
            setAuthState('authenticated');
          } else {
            setAuthState('unauthenticated');
          }
        }
      } else if (authMode === 'guest') {
        const localId = await AsyncStorage.getItem('local_user_id');
        if (localId) {
          setUserId(localId);
          setAuthState('guest');
        } else {
          setAuthState('unauthenticated');
        }
      } else {
        setAuthState('unauthenticated');
      }
    } catch {
      setAuthState('unauthenticated');
    }
  }, [setAuthState, setUserId]);

  const signOut = useCallback(async () => {
    const authMode = await AsyncStorage.getItem('auth_mode');
    if (authMode === 'authenticated') {
      await supabase.auth.signOut();
    }
    await AsyncStorage.multiSet([
      ['auth_mode', 'none'],
      ['has_completed_onboarding', 'false'],
    ]);
    await AsyncStorage.removeItem('local_user_id');
    setUserId(null);
    setAuthState('unauthenticated');
  }, [setAuthState, setUserId]);

  return { signInWithGoogle, continueAsGuest, initializeAuth, signOut };
}
