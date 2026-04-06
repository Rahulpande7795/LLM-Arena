"use client";

import React, { useState, useRef, useCallback } from "react";
import { ModalOverlay } from "./ModalOverlay";
import { TEMPLATES } from "@/lib/templates";
import type { TemplateCategory } from "@/types";

// ============================================================
// CATEGORY CONFIG
// ============================================================

type TabId = "all" | TemplateCategory;

const TABS: { id: TabId; label: string }[] = [
  { id: "all",          label: "All"          },
  { id: "code",         label: "Code"         },
  { id: "reasoning",    label: "Reasoning"    },
  { id: "language",     label: "Language"     },
  { id: "tool-calling", label: "Tool Calling" },
];

// ============================================================
// TYPES
// ============================================================

interface TemplatesModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSelect: (prompt: string, useTools: boolean) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const [activeTab,   setActiveTab]   = useState<TabId>("all");
  const [focusedIdx,  setFocusedIdx]  = useState<number>(-1);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = activeTab === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeTab);

  const handleSelect = useCallback(
    (prompt: string, useTools: boolean) => {
      onSelect(prompt, useTools);
      onClose();
    },
    [onSelect, onClose]
  );

  // Keyboard navigation between cards
  function onGridKeyDown(e: React.KeyboardEvent) {
    if (filtered.length === 0) return;
    let next = focusedIdx;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = Math.min(focusedIdx + 1, filtered.length - 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = Math.max(focusedIdx - 1, 0);
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault();
      const t = filtered[focusedIdx];
      if (t) handleSelect(t.prompt, t.useTools);
      return;
    }

    if (next !== focusedIdx) {
      setFocusedIdx(next);
      cardRefs.current[next]?.focus();
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Prompt Templates"
      size="lg"
    >
      {/* ── Category tabs ── */}
      <div
        role="tablist"
        aria-label="Template categories"
        style={{
          display:       "flex",
          borderBottom:  "1px solid var(--border)",
          marginBottom:  16,
          gap:           0,
          overflowX:     "auto",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => { setActiveTab(tab.id); setFocusedIdx(-1); }}
              style={{
                padding:       "8px 16px",
                border:        "none",
                borderBottom:  active ? "2px solid var(--accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                color:         active ? "var(--ink)" : "var(--ink-3)",
                fontWeight:    active ? 600 : 400,
                fontSize:      14,
                cursor:        "pointer",
                whiteSpace:    "nowrap",
                transition:    "color 120ms ease-out, border-color 120ms ease-out",
                marginBottom:  -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Template grid ── */}
      <div
        role="grid"
        onKeyDown={onGridKeyDown}
        style={{
          display:               "grid",
          gridTemplateColumns:   "repeat(2, 1fr)",
          gap:                   12,
        }}
      >
        {filtered.map((template, idx) => (
          <button
            key={template.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            role="gridcell"
            onClick={() => handleSelect(template.prompt, template.useTools)}
            onFocus={() => setFocusedIdx(idx)}
            tabIndex={focusedIdx === idx || (focusedIdx === -1 && idx === 0) ? 0 : -1}
            style={{
              textAlign:       "left",
              padding:         "14px 16px",
              backgroundColor: "var(--bg-2)",
              border:          "1.5px solid transparent",
              borderRadius:    "var(--r-lg)",
              cursor:          "pointer",
              transition:      "all 150ms ease-out",
              display:         "flex",
              flexDirection:   "column",
              gap:             8,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor  = "var(--accent)";
              el.style.transform    = "translateY(-2px)";
              el.style.boxShadow    = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor  = "transparent";
              el.style.transform    = "translateY(0)";
              el.style.boxShadow    = "none";
            }}
          >
            {/* Top row: category + tool badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily:    "var(--font-jetbrains-mono), monospace",
                  fontSize:      10,
                  color:         "var(--ink-4)",
                  backgroundColor: "var(--bg-3)",
                  padding:       "2px 6px",
                  borderRadius:  "var(--r-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  flexShrink:    0,
                }}
              >
                {template.category}
              </span>
              {template.useTools && (
                <span
                  style={{
                    fontFamily:    "var(--font-jetbrains-mono), monospace",
                    fontSize:      10,
                    color:         "var(--amber)",
                    backgroundColor: "color-mix(in srgb, var(--amber) 12%, transparent)",
                    border:        "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
                    padding:       "2px 6px",
                    borderRadius:  "var(--r-xs)",
                    flexShrink:    0,
                  }}
                >
                  ⚡ Tools
                </span>
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontWeight: 600,
                fontSize:   14,
                color:      "var(--ink)",
                lineHeight: 1.4,
              }}
            >
              {template.label}
            </div>

            {/* Prompt preview — 2 lines */}
            <div
              style={{
                fontSize:        13,
                color:           "var(--ink-3)",
                lineHeight:      1.55,
                overflow:        "hidden",
                display:         "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {template.prompt}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--ink-4)", padding: "24px 0" }}>
          No templates in this category.
        </p>
      )}
    </ModalOverlay>
  );
}