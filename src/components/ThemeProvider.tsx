"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

interface ThemeContextValue {
  /** `null` while server rendering and hydrating, before the client reads the preference. */
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * Applies the resolved theme before first paint so a dark reload never
 * flashes light. Mirrors `getSnapshot` below; this runs inline in <head>,
 * so it can't import from here.
 */
export const themeScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

// Private browsing and blocked site data both throw on access.
const storedTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
};

// Holds an explicit choice when localStorage is unavailable, so the toggle
// still works for the session even though it won't survive a reload.
let sessionTheme: Theme | null = null;

// The preference lives in localStorage and the media query, not in React
// state, so the provider reads it as an external store: an explicit choice
// wins, and the system preference leads until someone makes one.
const getSnapshot = (): Theme =>
  storedTheme() ?? sessionTheme ?? (darkQuery().matches ? "dark" : "light");

const getServerSnapshot = (): Theme | null => null;

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  const query = darkQuery();
  listeners.add(listener);
  query.addEventListener("change", listener);
  // Keeps other tabs in step.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
  };
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (theme !== null) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    sessionTheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Nothing to persist to; `sessionTheme` carries the choice instead.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
