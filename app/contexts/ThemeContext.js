import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "app-theme"; // "light" | "dark" | "system"

const ThemeContext = createContext({
  theme: "light",
  resolved: "light", // actual applied ("light"|"dark")
  setTheme: (_mode) => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system"); // default to system
  const [resolved, setResolved] = useState(Appearance.getColorScheme() || "light");

  // read persisted
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored) setThemeState(stored);
    })();
  }, []);

  // observe system changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === "system") setResolved(colorScheme || "light");
    });
    return () => sub?.remove?.();
  }, [theme]);

  // compute resolved when theme changes
  useEffect(() => {
    if (theme === "system") {
      setResolved(Appearance.getColorScheme() || "light");
    } else {
      setResolved(theme);
    }
  }, [theme]);

  const setTheme = useCallback(async (mode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const value = useMemo(() => ({ theme, resolved, setTheme, toggleTheme }), [theme, resolved, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
