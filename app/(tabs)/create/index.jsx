// app/(tabs)/create/index.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useTheme } from '../../../utils/theme';

const K_TOKEN = 'auth:token';

export default function Create() {
  // ✅ ALWAYS call hooks at the top, every render, same order
  const t = useTheme();                  // Hook #1 (internally uses useSyncExternalStore)
  const [checked, setChecked] = useState(false); // Hook #2
  const [hasToken, setHasToken] = useState(false); // Hook #3

  useEffect(() => {                      // Hook #4
    let mounted = true;
    AsyncStorage.getItem(K_TOKEN).then((token) => {
      if (mounted) {
        setHasToken(!!token);
        setChecked(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  // ⛔ Do NOT call hooks below these early returns
  if (!checked) {
    // simple placeholder view (no new hooks)
    return <View style={[styles.wrap, { backgroundColor: t.bg }]} />;
  }

  if (!hasToken) {
    return <Redirect href="/auth/login" />;
  }

  // normal content
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.h1, { color: t.text }]}>Create Post</Text>
      <Text style={{ color: t.text + '99' }}>Form coming next…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
});
