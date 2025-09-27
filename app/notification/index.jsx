import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { COLORS } from '@/utils/theme'; // or use your relative path

export default function Notifications() {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.black : COLORS.white }]}>
      <Text style={[styles.h1, { color: isDark ? COLORS.white : COLORS.black }]}>Notifications</Text>
      <Text style={{ color: isDark ? COLORS.white : COLORS.black, opacity: 0.7 }}>
        Likes, comments, and follows will show here.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 30, fontWeight: '700', marginBottom: 8 },
});
