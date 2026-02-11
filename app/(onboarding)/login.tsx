import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
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
    await continueAsGuest();
    router.push('/(onboarding)/voice-type');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <Text className="text-3xl font-bold text-gray-900 mb-3">Welcome</Text>
        <Text className="text-lg text-gray-600 mb-10">
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
          />
        </View>

        <Text className="text-sm text-gray-400 text-center mt-6">
          You can always sign in later to back up your data
        </Text>
      </View>
    </SafeAreaView>
  );
}
