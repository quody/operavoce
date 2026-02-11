import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { StepIndicator } from '@/components/common/StepIndicator';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/(onboarding)/voice-type');
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      router.push('/(onboarding)/voice-type');
    } catch (error) {
      console.error('Guest setup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-950">
      <StepIndicator totalSteps={3} currentStep={0} />

      <View className="flex-1 justify-center px-8">
        <Text className="text-white text-3xl font-bold mb-3">Welcome</Text>
        <Text className="text-primary-300 text-base mb-12 leading-6">
          Sign in to sync your progress across devices, or continue without an account.
        </Text>

        <View className="gap-4">
          <Button
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          />

          <Button
            title="Continue without account"
            onPress={handleGuest}
            variant="outline"
            size="lg"
            fullWidth
            dark
          />
        </View>

        <Text className="text-sm text-primary-600 text-center mt-8">
          You can always sign in later to back up your data
        </Text>
      </View>
    </SafeAreaView>
  );
}
