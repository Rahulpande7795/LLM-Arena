"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

// ============================================================
// AnimatedThemeToggler
// Sun/moon animated toggle that connects to the existing theme context.
// ============================================================

export function AnimatedThemeToggler() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      style={{
        position:        "relative",
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        width:           38,
        height:          22,
        borderRadius:    "var(--r-full)",
        border:          "1.5px solid var(--border-s)",
        backgroundColor: isDark ? "var(--accent)" : "var(--bg-3)",
        cursor:          "pointer",
        outline:         "none",
        transition:      "background-color 300ms ease-out, border-color 300ms ease-out",
        flexShrink:      0,
        padding:         0,
      }}
    >
      {/* Sliding knob */}
      <span
        aria-hidden="true"
        style={{
          position:        "absolute",
          top:             2,
          left:            isDark ? "calc(100% - 20px)" : 2,
          width:           16,
          height:          16,
          borderRadius:    "50%",
          backgroundColor: isDark ? "#fff" : "var(--accent)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          fontSize:        9,
          transition:      "left 280ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 280ms ease-out",
          boxShadow:       "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
