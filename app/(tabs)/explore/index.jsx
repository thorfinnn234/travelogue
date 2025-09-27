// app/(tabs)/explore/index.jsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../../../utils/theme'; // ← no alias, uses theme tokens

export default function ExploreScreen() {
  const t = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      <Text style={[styles.h1, { color: t.text }]}>Explore</Text>
      <Text style={{ color: t.text + '99' }}>Search by country, city, or tag.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
