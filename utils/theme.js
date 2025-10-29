// app/utils/theme.js
import { useColorScheme } from "react-native";

// Basic palette
export const COLORS = {
  white: "#ffffff",
  black: "#111827",
  gray500: "#6b7280",
  gray200: "#e5e7eb",
  primary: "#22a06b",
};

// Simple hook (if you ever want dark mode later)
export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    isDark,
    bg: COLORS.white,          // force white for now, per your spec
    text: COLORS.black,
    subtle: "#f3f4f6",
    border: COLORS.gray200,
    primary: COLORS.primary,
    onPrimary: "#ffffff",
    secondary: COLORS.black,
  };
}
