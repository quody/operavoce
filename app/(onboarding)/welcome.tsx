import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-primary-950">
      <View className="flex-1 justify-center items-center px-10">
        {/* Logo area */}
        <View className="items-center mb-16">
          <View className="w-24 h-24 rounded-full bg-primary-800 items-center justify-center mb-8 border-2 border-primary-600">
            <Text className="text-accent-400 text-5xl font-serif">V</Text>
          </View>
          <Text className="text-white text-4xl font-bold tracking-tight mb-2">OperaVoce</Text>
          <View className="w-12 h-0.5 bg-accent-500 mb-5" />
          <Text className="text-primary-300 text-base text-center leading-7 font-light">
            Your personal opera singing coach.{'\n'}
            Structured training programs to{'\n'}
            develop your voice.
          </Text>
        </View>

        <View className="w-full gap-4">
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/login')}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </View>

      {/* Decorative bottom */}
      <View className="items-center pb-8">
        <Text className="text-primary-700 text-xs tracking-widest uppercase">
          Train like the masters
        </Text>
      </View>
    </SafeAreaView>
  );
}
