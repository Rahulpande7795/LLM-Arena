"use client";

import React from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface ToolMockToggleProps {
  enabled:  boolean;
  onToggle: () => void;
}

export function ToolMockToggle({ enabled, onToggle }: ToolMockToggleProps) {
  return (
    <div
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        gap:             8,
        padding:         "5px 12px",
        borderRadius:    "var(--r-full)",
        border:          `1.5px solid ${enabled ? "var(--accent)" : "var(--border-s)"}`,
        backgroundColor: enabled
          ? "color-mix(in srgb, var(--accent) 12%, transparent)"
          : "transparent",
        fontSize:        13,
        color:           enabled ? "var(--accent-hi)" : "var(--ink-3)",
        fontWeight:      enabled ? 600 : 400,
        transition:      "all 150ms ease-out",
        cursor:          "pointer",
        userSelect:      "none",
        whiteSpace:      "nowrap",
      }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={enabled}
      aria-label="Toggle tool calling mode"
    >
      <span aria-hidden="true">⚡</span>
      <span>Tool Mode</span>
      <ToggleSwitch
        checked={enabled}
        onChange={onToggle}
        size="sm"
      />
    </div>
  );
}