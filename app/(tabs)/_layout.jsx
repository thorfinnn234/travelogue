// app/(tabs)/_layout.jsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../utils/theme';

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
  initialRouteName="feeds/index"                 // start on Feeds
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,           // sky blue
        tabBarInactiveTintColor: t.text + '99',
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border, height: 60 },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      {/* 1) Feeds */}
      <Tabs.Screen
        name="feeds/index"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />

      {/* 2) Create */}
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />

      {/* 3) Explore */}
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />

      {/* 4) Profile */}
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
