// app/auth/login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../utils/theme';

const K_TOKEN = 'auth:token';
const K_ONBOARDED = 'app:onboarded';

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !pwd) return Alert.alert('Missing fields', 'Enter email and password');
    try {
      setBusy(true);
      await AsyncStorage.setItem(K_TOKEN, 'demo');
      await AsyncStorage.setItem(K_ONBOARDED, '1');
      router.replace('/feed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.h1, { color: t.text }]}>Login</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: t.text }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="you@mail.com"
          placeholderTextColor={t.text + '99'}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: t.text }]}>Password</Text>
        <TextInput
          value={pwd}
          onChangeText={setPwd}
          secureTextEntry
          style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="••••••••"
          placeholderTextColor={t.text + '99'}
        />
      </View>

      <Pressable onPress={submit} disabled={busy}
        style={({ pressed }) => [
          styles.primary,
          { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed || busy ? 0.9 : 1 },
        ]}>
        <Text style={[styles.primaryText, { color: t.onPrimary }]}>{busy ? 'Please wait…' : 'Continue'}</Text>
      </Pressable>

      <Link href="/auth/signUp" style={{ marginTop: 12, color: t.secondary }}>
        Create account
      </Link>
    </View>
  );
}

const R = 24;
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: 'center' },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: { height: 50, borderWidth: 1, borderRadius: R, paddingHorizontal: 14 },
  primary: { height: 52, borderRadius: R, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontWeight: '700', fontSize: 16 },
});
