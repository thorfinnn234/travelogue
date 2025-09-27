// app/(tabs)/profile/index.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../utils/theme';

const K_TOKEN = 'auth:token';

export default function Profile() {
  const t = useTheme();                 // theme tokens
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(K_TOKEN).then(setToken);
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem(K_TOKEN);
    router.replace('/auth/login');
  };

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.h1, { color: t.text }]}>Profile</Text>
      <Text style={{ color: t.text + '99', marginBottom: 16 }}>
        {token ? 'Logged in' : 'Guest'}
      </Text>

      {token ? (
        // LOGOUT: solid sky-blue
        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.btnBase,
            { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: t.onPrimary }]}>Log out</Text>
        </Pressable>
      ) : (
        // LOGIN: outline deep-navy
        <Pressable
          onPress={() => router.push('/auth/login')}
          style={({ pressed }) => [
            styles.btnBase,
            { backgroundColor: 'transparent', borderColor: t.secondary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: t.secondary }]}>Log in</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  btnBase: {
    height: 52,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnText: { fontWeight: '700', fontSize: 16 },
});
