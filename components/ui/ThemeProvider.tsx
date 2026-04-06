"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ThemeMode } from "@/types";

// ============================================================
// CONTEXT
// ============================================================

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

// ============================================================
// APPLY THEME TO DOM
// ============================================================

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

// ============================================================
// PROVIDER
// ============================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  // On mount: read from Zustand persisted store in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ia-store");
      if (raw) {
        const parsed = JSON.parse(raw);
        const saved: ThemeMode = parsed?.state?.theme ?? "dark";
        setThemeState(saved);
        applyTheme(saved);
        return;
      }
    } catch {
      // ignore parse errors
    }
    applyTheme("dark");
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyTheme(next);
    // Also update Zustand persisted store so it survives refresh
    try {
      const raw = localStorage.getItem("ia-store");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.state.theme = next;
        localStorage.setItem("ia-store", JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, isDark: theme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useTheme() {
  return useContext(ThemeContext);
}