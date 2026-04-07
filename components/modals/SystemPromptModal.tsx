"use client";

import React, { useState } from "react";
import { ModalOverlay } from "./ModalOverlay";
import { Button } from "@/components/ui/Button";
import { useArenaStore } from "@/hooks/useArenaStore";

// ============================================================
// PRESETS
// ============================================================

const PRESETS: { label: string; value: string }[] = [
  {
    label: "Default",
    value: "",
  },
  {
    label: "Code Expert",
    value:
      "You are an expert software engineer. Write clean, efficient, well-commented code. Always include error handling and type annotations. Prefer readability over cleverness.",
  },
  {
    label: "Concise",
    value:
      "Be extremely concise. Give direct answers only. No preamble, no closing remarks, no explanations unless explicitly asked. Bullet points over paragraphs.",
  },
  {
    label: "Step-by-step",
    value:
      "Break down all problems step by step. Number each step clearly. Explain your reasoning at each stage before giving the final answer. Show your work.",
  },
  {
    label: "Bilingual EN/HI",
    value:
      "Respond in both English and Hindi. Provide the complete English answer first, then provide the full Hindi translation below it, clearly labelled.",
  },
];

// ============================================================
// COMPONENT
// ============================================================

interface SystemPromptModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function SystemPromptModal({ isOpen, onClose }: SystemPromptModalProps) {
  const storedPrompt  = useArenaStore((s) => s.systemPrompt);
  const setSystemPrompt = useArenaStore((s) => s.setSystemPrompt);

  const [local, setLocal] = useState(storedPrompt);

  function handleSave() {
    setSystemPrompt(local);
    onClose();
  }

  function handleCancel() {
    setLocal(storedPrompt); // discard changes
    onClose();
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={handleCancel}
      title="System Prompt"
      size="md"
    >
      {/* Textarea */}
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="You are a helpful assistant…"
        aria-label="System prompt"
        rows={6}
        style={{
          width:           "100%",
          padding:         "10px 14px",
          backgroundColor: "var(--bg-2)",
          border:          "1.5px solid var(--border-s)",
          borderRadius:    "var(--r-lg)",
          color:           "var(--ink)",
          fontSize:        15,
          lineHeight:      1.65,
          fontFamily:      "var(--font-plus-jakarta-sans), sans-serif",
          resize:          "vertical",
          outline:         "none",
          boxSizing:       "border-box",
          minHeight:       160,
          transition:      "border-color 150ms ease-out",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--border-s)")}
      />

      {/* Preset buttons */}
      <div
        style={{
          display:   "flex",
          flexWrap:  "wrap",
          gap:       8,
          marginTop: 14,
        }}
      >
        <span
          style={{
            width:      "100%",
            fontSize:   12,
            color:      "var(--ink-4)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 2,
          }}
        >
          Quick presets
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setLocal(preset.value)}
            style={{
              padding:         "5px 12px",
              borderRadius:    "var(--r-full)",
              border:          "1.5px solid var(--border-s)",
              backgroundColor: local === preset.value
                ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                : "transparent",
              borderColor:     local === preset.value ? "var(--accent)" : "var(--border-s)",
              color:           local === preset.value ? "var(--accent-hi)" : "var(--ink-3)",
              fontSize:        13,
              fontWeight:      local === preset.value ? 600 : 400,
              cursor:          "pointer",
              transition:      "all 120ms ease-out",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display:        "flex",
          justifyContent: "flex-end",
          gap:            8,
          marginTop:      200,
          paddingTop:     16,
          borderTop:      "1px solid var(--border)",
        }}
      >
        <Button variant="ghost" size="md" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSave}>
          Save
        </Button>
      </div>
    </ModalOverlay>
  );
}