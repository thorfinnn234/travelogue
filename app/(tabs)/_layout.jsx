// app/(tabs)/_layout.jsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';           // ⬅ add (optional)
import { useTheme } from '../../utils/theme';

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      initialRouteName="feeds/index"
      // 👇 This removes the white background behind the status bar / top area
      sceneContainerStyle={{ backgroundColor: 'transparent' }}   // ✅ important
      screenOptions={{
        headerShown: false,
        // If you ever turn headers back on, this prevents a header bg strip:
        headerTransparent: true,                                 // ✅ safe default
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.text + '99',
        tabBarStyle: {
          backgroundColor: t.bg,
          borderTopColor: t.border,
          height: 60,
          // Optionally float the tab bar and avoid layout color bleeding:
          ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
        },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="feeds/index"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
