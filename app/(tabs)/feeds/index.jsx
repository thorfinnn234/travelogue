import React from 'react';
import { View, Text, StyleSheet, StatusBar, useColorScheme } from 'react-native';
import { COLORS } from '@/utils/theme';

export default function FeedScreen() {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={[styles.container, isDark ? styles.bgBlack : styles.bgWhite]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.h1, isDark ? styles.textWhite : styles.textBlack]}>Feed</Text>
      <Text style={isDark ? styles.textWhite : styles.textBlack}>Your travel posts will appear here.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bgWhite: { backgroundColor: COLORS.white }, bgBlack: { backgroundColor: COLORS.black },
  textWhite: { color: COLORS.white }, textBlack: { color: COLORS.black },
  h1: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
