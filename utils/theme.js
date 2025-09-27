// utils/theme.js
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

/** 2-color brand: sky blue + deep navy */
const THEMES = {
  duo: {
    light: {
      bg: '#FFFFFF',
      text: '#0F172A',       // deep navy
      primary: '#38BDF8',    // sky blue
      onPrimary: '#0F172A',
      secondary: '#0F172A',
      onSecondary: '#FFFFFF',
      card: '#FFFFFF',
      border: 'rgba(15,23,42,0.12)',
      subtle: 'rgba(56,189,248,0.10)',
    },
    dark: {
      bg: '#000000',
      text: '#FFFFFF',
      primary: '#38BDF8',
      onPrimary: '#0A0A0B',
      secondary: '#0F172A',
      onSecondary: '#FFFFFF',
      card: '#000000',
      border: 'rgba(255,255,255,0.12)',
      subtle: 'rgba(56,189,248,0.16)',
    },
  },
};

export const DEFAULT_THEME = 'duo';

/**
 * Force default mode = 'light' (white background) across the app.
 * To follow device theme later, change DEFAULT_MODE to 'system'.
 */
export const DEFAULT_MODE = 'light'; // 'light' | 'dark' | 'system'

export function useTheme(name = DEFAULT_THEME, modeProp = null) {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const mode =
    (modeProp ?? DEFAULT_MODE) === 'system'
      ? (scheme === 'dark' ? 'dark' : 'light')
      : (modeProp ?? DEFAULT_MODE);

  return useMemo(() => THEMES[name][mode], [name, mode]);
}

/* --- TEMP compatibility shim, safe to remove after migrating ---
   (Prevents crashes if any old code still imports COLORS.*) */
export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  black05: 'rgba(0,0,0,0.05)',
  black10: 'rgba(0,0,0,0.10)',
  white10: 'rgba(255,255,255,0.10)',
};
