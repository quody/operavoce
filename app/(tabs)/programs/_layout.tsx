import { Stack } from 'expo-router';

export default function ProgramsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[programId]" />
      <Stack.Screen name="lesson/[lessonId]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
