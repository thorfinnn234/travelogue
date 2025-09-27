import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../utils/theme';

export default function Welcome() {
  const router = useRouter();
  const t = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: t.text }]}>Welcome</Text>
      <Text style={[styles.body, { color: t.text + '99' }]}>
        Read real travel experiences and share yours.
      </Text>

      <View style={[styles.hero, { backgroundColor: t.subtle, borderColor: t.border }]} />

      <Pressable
        onPress={() => router.push('/onboarding/intro1')}
        style={({ pressed }) => [styles.btn, { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed ? 0.9 : 1 }]}
      >
        <Text style={[styles.btnText, { color: t.onPrimary }]}>Next</Text>
      </Pressable>
    </View>
  );
}
const R = 24;
const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  title: { fontSize:36, fontWeight:'800' },
  body: { marginTop:8, fontSize:16, fontWeight:'500' },
  hero: { height:240, marginVertical:28, borderRadius:R, borderWidth:1 },
  btn: { height:52, borderRadius:R, alignItems:'center', justifyContent:'center', borderWidth:1 },
  btnText: { fontWeight:'700', fontSize:16 },
});
