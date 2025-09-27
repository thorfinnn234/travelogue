// components/ui/Button.jsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function Button({ title, variant = 'solid', style, ...rest }) {
  const t = useTheme();
  const solid = variant === 'solid';
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        solid
          ? { backgroundColor: t.primary, borderColor: t.primary, opacity: pressed ? 0.9 : 1 }
          : { backgroundColor: 'transparent', borderColor: t.secondary, opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <Text style={solid ? [styles.text, { color: t.onPrimary }] : [styles.text, { color: t.secondary }]}>
        {title}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: { height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  text: { fontWeight: '700', fontSize: 16 },
});
