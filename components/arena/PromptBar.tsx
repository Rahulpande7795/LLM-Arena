"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ToolMockToggle } from "@/components/tool-calling/ToolMockToggle";

// ============================================================
// ICONS
// ============================================================


const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
  </svg>
);

// ============================================================
// TYPES
// ============================================================

interface PromptBarProps {
  value:            string;
  onChange:         (v: string) => void;
  onRun:            () => void;
  onCancel:         () => void;
  onTemplates:      () => void;
  running:          boolean;
  toolMode:         boolean;
  onToggleToolMode: () => void;
  shake:            boolean;           // parent sets true to trigger shake
  onShakeEnd:       () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function PromptBar({
  value,
  onChange,
  onRun,
  onCancel,
  onTemplates,
  running,
  toolMode,
  onToggleToolMode,
  shake,
  onShakeEnd,
}: PromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-resize textarea ──────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // ── Shake animation ───────────────────────────────────────
  useEffect(() => {
    if (!shake) return;
    const el = textareaRef.current;
    if (!el) return;
    el.classList.add("shake");
    const t = setTimeout(() => {
      el.classList.remove("shake");
      onShakeEnd();
    }, 400);
    return () => clearTimeout(t);
  }, [shake, onShakeEnd]);

  // ── Ctrl+Enter to run ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!running) onRun();
      }
    },
    [running, onRun]
  );

  // Token estimate
  const charCount = value.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  return (
    <div
      style={{
        position:            "fixed",
        bottom:              0,
        right:               0,
        left:                "var(--sidebar-width, 268px)",
        zIndex:              30,
        backgroundColor:     "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter:      "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop:           "1px solid var(--border)",
        padding:             "10px 16px",
        paddingBottom:       "max(10px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display:    "flex",
          alignItems: "flex-end",
          gap:        8,
          maxWidth:   1200,
          margin:     "0 auto",
        }}
      >
        {/* ── Left icons ── */}
        <div
          style={{
            display:    "flex",
            gap:        4,
            flexShrink: 0,
            paddingBottom: 4,
          }}
          className="hide-mobile"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onTemplates}
            leftIcon={<SparklesIcon />}
            aria-label="Templates (Ctrl+K)"
            title="Templates (Ctrl+K)"
          />
        </div>

        {/* ── Textarea + counter ── */}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a prompt… (Ctrl+Enter to run)"
            aria-label="Prompt input"
            rows={1}
            style={{
              width:           "100%",
              minHeight:       44,
              maxHeight:       200,
              padding:         "10px 14px",
              backgroundColor: "var(--bg-2)",
              borderRadius:    "var(--r-xl)",
              border:          "1.5px solid var(--border-s)",
              color:           "var(--ink)",
              fontSize:        16,
              lineHeight:      1.65,
              fontFamily:      "var(--font-plus-jakarta-sans), sans-serif",
              resize:          "none",
              outline:         "none",
              display:         "block",
              transition:      "border-color 150ms ease-out, box-shadow 150ms ease-out",
              boxSizing:       "border-box",
              overflowY:       "auto",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow  = "var(--shadow-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-s)";
              e.target.style.boxShadow  = "none";
            }}
          />

          {/* Char + Token estimate */}
          {value.length > 0 && (
            <span
              style={{
                position:   "absolute",
                bottom:     6,
                right:      12,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize:   11,
                color:      "var(--ink-4)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {charCount} chars · ~{estimatedTokens} tok
            </span>
          )}
        </div>

        {/* ── Right: tool toggle + run/cancel ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-end",
            gap:           6,
            flexShrink:    0,
            paddingBottom: 2,
          }}
        >
          {/* Tool mode toggle */}
          <div className="hide-mobile">
            <ToolMockToggle enabled={toolMode} onToggle={onToggleToolMode} />
          </div>

          {/* Run / Cancel button */}
          <AnimatePresence mode="wait" initial={false}>
            {running ? (
              <motion.div
                key="cancel"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Button
                  variant="danger"
                  size="md"
                  onClick={onCancel}
                  aria-label="Cancel inference"
                >
                  ✕ Cancel
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="run"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={onRun}
                  aria-label="Run prompt"
                >
                  Run →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}