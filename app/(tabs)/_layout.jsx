import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../utils/theme';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.text + '99',
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border, height: 60 },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="feed/index"    options={{ title: 'Home',    tabBarIcon: p => <Ionicons name="home-outline" {...p} /> }} />
      <Tabs.Screen name="explore/index" options={{ title: 'Explore', tabBarIcon: p => <Ionicons name="search-outline" {...p} /> }} />
      <Tabs.Screen name="create/index"  options={{ title: 'Create',  tabBarIcon: p => <Ionicons name="add-circle-outline" {...p} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Profile', tabBarIcon: p => <Ionicons name="person-outline" {...p} /> }} />
    </Tabs>
  );
}
