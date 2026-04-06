"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import type { ViewMode } from "@/types";

// ============================================================
// ICONS
// ============================================================

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>  <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/> <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/> <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/> <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const QuestionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ============================================================
// TYPES
// ============================================================

interface TopbarProps {
  currentView:   ViewMode;
  serverStatus:  "connected" | "disconnected" | "checking";
  onMenuOpen:    () => void;
  onShortcuts:   () => void;
}

// ============================================================
// SERVER STATUS DOT
// ============================================================

function StatusDot({
  status,
}: {
  status: "connected" | "disconnected" | "checking";
}) {
  const color =
    status === "connected"    ? "var(--green)" :
    status === "disconnected" ? "var(--red)"   : "var(--amber)";

  const label =
    status === "connected"    ? "Connected"    :
    status === "disconnected" ? "Disconnected" : "Checking…";

  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        gap:             6,
        padding:         "5px 10px",
        borderRadius:    "var(--r-full)",
        backgroundColor: "var(--bg-2)",
      }}
    >
      <span
        style={{
          display:         "inline-block",
          width:           8,
          height:          8,
          borderRadius:    "50%",
          backgroundColor: color,
          flexShrink:      0,
          animation:
            status === "checking" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span
        className="hide-mobile"
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize:   12,
          color:      "var(--ink-3)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function Topbar({
  currentView,
  serverStatus,
  onMenuOpen,
  onShortcuts,
}: TopbarProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const viewLabel =
    currentView.charAt(0).toUpperCase() + currentView.slice(1);

  return (
    <header
      style={{
        height:              56,
        position:            "sticky",
        top:                 0,
        zIndex:              40,
        display:             "flex",
        alignItems:          "center",
        justifyContent:      "space-between",
        padding:             "0 16px",
        gap:                 8,
        backgroundColor:     "color-mix(in srgb, var(--bg-1) 88%, transparent)",
        backdropFilter:      "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom:        "1px solid var(--border)",
        flexShrink:          0,
      }}
    >
      {/* ── Left ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuOpen}
          leftIcon={<MenuIcon />}
          aria-label="Open menu"
          className="show-mobile"
        />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <span style={{ fontSize: 14, color: "var(--ink-3)" }}>Arena</span>
          <span style={{ fontSize: 14, color: "var(--ink-4)", margin: "0 6px" }}>/</span>
          <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>
            {viewLabel}
          </span>
        </nav>
      </div>

      {/* ── Right ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <StatusDot status={serverStatus} />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          leftIcon={isDark ? <SunIcon /> : <MoonIcon />}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          title={`Switch to ${isDark ? "light" : "dark"} theme`}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={onShortcuts}
          leftIcon={<QuestionIcon />}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (Ctrl+/)"
        />
      </div>
    </header>
  );
}