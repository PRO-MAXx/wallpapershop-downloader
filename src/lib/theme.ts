import { useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "system" | "light" | "dark";

const THEME_KEY = "wallpapershop-theme";

export function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore storage errors */
  }
  return "system";
}

export function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

// Shared store so the header button and the Settings page always stay in sync
let currentMode: ThemeMode = getStoredTheme();
const listeners = new Set<() => void>();

function setThemeMode(mode: ThemeMode) {
  currentMode = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore storage errors */
  }
  applyTheme(mode);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Follow Windows theme changes while in "system" mode
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (currentMode === "system") applyTheme("system");
    });
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, () => currentMode);
  const setMode = useCallback((m: ThemeMode) => setThemeMode(m), []);
  return { mode, setMode };
}
