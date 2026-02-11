import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { COLORS } from '@/lib/constants';

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: '\u2302', inactive: '\u2302' },
  Programs: { active: '\u266B', inactive: '\u266B' },
  Calendar: { active: '\u25A3', inactive: '\u25A3' },
  Progress: { active: '\u2197', inactive: '\u2197' },
  Profile: { active: '\u25CF', inactive: '\u25CB' },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons = TAB_ICONS[label] ?? { active: '?', inactive: '?' };

  return (
    <View className="items-center justify-center pt-1">
      <Text
        className={`text-xl ${focused ? 'text-primary-600' : 'text-stone-400'}`}
      >
        {focused ? icons.active : icons.inactive}
      </Text>
      {focused && (
        <View className="w-1 h-1 rounded-full bg-primary-600 mt-1" />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e7e5e4',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: 'Programs',
          tabBarIcon: ({ focused }) => <TabIcon label="Programs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => <TabIcon label="Calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon label="Progress" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
