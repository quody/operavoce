import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

export default function AccountScreen() {
  const router = useRouter();
  const { signInWithGoogle, signOut } = useAuth();
  const { state } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Your data has been synced to your account.');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-primary-500">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 ml-2">Account</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {state === 'guest' ? (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Local Mode</Text>
            <Text className="text-gray-600 mb-6">
              Your data is stored locally on this device. Sign in with Google to enable cloud backup and cross-device sync.
            </Text>
            <Button
              title="Sign in with Google"
              onPress={handleSignIn}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            />
            <Text className="text-xs text-gray-400 text-center mt-4">
              Your existing progress will be merged with your account
            </Text>
          </View>
        ) : state === 'authenticated' ? (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Signed In</Text>
            <Text className="text-gray-600 mb-6">
              Your data is synced to your Google account.
            </Text>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              size="lg"
              fullWidth
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
