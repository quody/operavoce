import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-primary-900">
      <View className="flex-1 justify-center items-center px-8">
        <View className="items-center mb-12">
          <Text className="text-accent-400 text-6xl font-bold mb-2">OV</Text>
          <Text className="text-white text-4xl font-bold mb-3">OperaVoce</Text>
          <Text className="text-primary-200 text-lg text-center leading-7">
            Your personal opera singing coach.{'\n'}
            Structured training programs to{'\n'}
            develop your voice.
          </Text>
        </View>

        <View className="w-full gap-4">
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/login')}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
