import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { clearAllData } from '@/lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your local data including progress, sessions, and profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await AsyncStorage.clear();
              router.replace('/');
            } catch {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
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
    <SafeAreaView className="flex-1 bg-surface-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-surface-200">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 p-1">
          <Text className="text-primary-600 text-lg">{'\u2039'}</Text>
          <Text className="text-primary-600">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-900 ml-3">Account</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        {state === 'guest' ? (
          <View>
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-accent-50 items-center justify-center mb-4">
                <Text className="text-accent-500 text-2xl">{'\u2601'}</Text>
              </View>
              <Text className="text-2xl font-bold text-stone-900 mb-2">Local Mode</Text>
              <Text className="text-stone-500 text-center leading-6">
                Your data is stored locally on this device. Sign in with Google to enable cloud backup and sync.
              </Text>
            </View>
            <Button
              title="Sign in with Google"
              onPress={handleSignIn}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            />
            <Text className="text-xs text-stone-400 text-center mt-4">
              Your existing progress will be merged with your account
            </Text>
          </View>
        ) : state === 'authenticated' ? (
          <View>
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-success-50 items-center justify-center mb-4">
                <Text className="text-success-500 text-2xl">{'\u2713'}</Text>
              </View>
              <Text className="text-2xl font-bold text-stone-900 mb-2">Signed In</Text>
              <Text className="text-stone-500 text-center">
                Your data is synced to your Google account.
              </Text>
            </View>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              size="lg"
              fullWidth
            />
          </View>
        ) : null}

        {/* Danger zone */}
        <View className="mt-16 mb-10 border border-red-200 rounded-2xl p-5 bg-red-50">
          <Text className="text-sm font-semibold text-red-700 mb-1">Danger Zone</Text>
          <Text className="text-xs text-red-400 mb-4">This action is permanent and cannot be undone.</Text>
          <TouchableOpacity
            onPress={handleClearData}
            className="bg-red-600 py-3.5 rounded-2xl items-center"
          >
            <Text className="text-white font-semibold">Clear All Local Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
