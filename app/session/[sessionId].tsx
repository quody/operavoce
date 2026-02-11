import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';

export default function DeepLinkSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  // Redirect to the tab-based session detail
  return <Redirect href={`/(tabs)/calendar/session/${sessionId}`} />;
}
