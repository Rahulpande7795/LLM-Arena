"use client";

import React from "react";
import { ModalOverlay } from "./ModalOverlay";
import { SHORTCUT_LABELS } from "@/lib/shortcuts";
import type { ShortcutKey } from "@/types";

// ============================================================
// KEY BADGE
// ============================================================

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "2px 7px",
        fontFamily:      "var(--font-jetbrains-mono), monospace",
        fontSize:        12,
        fontWeight:      500,
        color:           "var(--ink-2)",
        backgroundColor: "var(--bg-2)",
        border:          "1px solid var(--border-s)",
        borderRadius:    "var(--r-xs)",
        boxShadow:       "0 1px 0 var(--border-s)",
        lineHeight:      1.6,
        whiteSpace:      "nowrap",
      }}
    >
      {label}
    </kbd>
  );
}

// ============================================================
// TYPES
// ============================================================

interface ShortcutsModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

// Ordered list for display
const SHORTCUT_ORDER: ShortcutKey[] = [
  "run",
  "templates",
  "export",
  "clear",
  "shortcuts",
  "escape",
  "theme",
  "fullscreen",
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="sm"
    >
      <table
        style={{
          width:           "100%",
          borderCollapse:  "collapse",
        }}
      >
        <tbody>
          {SHORTCUT_ORDER.map((key, idx) => {
            const shortcut = SHORTCUT_LABELS[key];
            const isLast   = idx === SHORTCUT_ORDER.length - 1;

            return (
              <tr
                key={key}
                style={{
                  borderBottom: isLast ? "none" : "1px solid var(--border)",
                }}
              >
                {/* Keys */}
                <td
                  style={{
                    padding:    "10px 0",
                    verticalAlign: "middle",
                    width:      "40%",
                  }}
                >
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                    {shortcut.keys.map((k, i) => (
                      <React.Fragment key={k}>
                        <KeyBadge label={k} />
                        {i < shortcut.keys.length - 1 && (
                          <span
                            style={{
                              fontSize: 11,
                              color:    "var(--ink-4)",
                            }}
                          >
                            +
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </td>

                {/* Description */}
                <td
                  style={{
                    padding:       "10px 0 10px 16px",
                    fontSize:      14,
                    color:         "var(--ink-3)",
                    lineHeight:    1.5,
                    verticalAlign: "middle",
                  }}
                >
                  {shortcut.description}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p
        style={{
          marginTop:  16,
          fontSize:   12,
          color:      "var(--ink-4)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
        }}
      >
        Single-key shortcuts (T, F) are disabled when focus is inside an input field.
      </p>
    </ModalOverlay>
  );
}