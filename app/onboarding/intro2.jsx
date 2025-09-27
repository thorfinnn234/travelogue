import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../utils/theme';

const K_ONBOARDED = 'app:onboarded';

export default function Intro2() {
  const router = useRouter();
  const t = useTheme();

  const finish = async () => {
    await AsyncStorage.setItem(K_ONBOARDED, '1');
    router.replace('/auth/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Text style={[styles.h1, { color: t.text }]}>Share Your Journey</Text>
      <Text style={[styles.body, { color: t.text + '99' }]}>
        Post photos, tips, and stories to help others travel better.
      </Text>

      <View style={[styles.hero, { backgroundColor: t.subtle, borderColor: t.border }]} />

      <View style={{ flexDirection:'row', gap:12 }}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.secondary, { borderColor: t.secondary, backgroundColor: pressed ? t.subtle : 'transparent' }]}>
          <Text style={[styles.secondaryText, { color: t.secondary }]}>Back</Text>
        </Pressable>
        <Pressable onPress={finish} style={({ pressed }) => [styles.primary, { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed ? 0.9 : 1 }]}>
          <Text style={[styles.primaryText, { color: t.onPrimary }]}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}
const R = 24;
const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  h1: { fontSize:28, fontWeight:'800', marginBottom:8 },
  body: { fontSize:16, fontWeight:'500' },
  hero: { height:200, marginVertical:24, borderRadius:R, borderWidth:1 },
  primary: { flex:1, height:52, borderRadius:R, alignItems:'center', justifyContent:'center', borderWidth:1 },
  primaryText: { fontWeight:'700', fontSize:16 },
  secondary: { flex:1, height:52, borderRadius:R, alignItems:'center', justifyContent:'center', borderWidth:1 },
  secondaryText: { fontWeight:'600', fontSize:16 },
});
