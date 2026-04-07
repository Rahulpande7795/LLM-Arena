"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArenaStore } from "@/hooks/useArenaStore";

// ============================================================
// ICONS
// ============================================================

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ============================================================
// COMPONENT
// ============================================================

export function SystemPromptContainer() {
  const systemPrompt    = useArenaStore((s) => s.systemPrompt);
  const setSystemPrompt = useArenaStore((s) => s.setSystemPrompt);

  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(systemPrompt);

  // Sync local value when store changes (e.g. from templates)
  React.useEffect(() => {
    setLocalValue(systemPrompt);
  }, [systemPrompt]);

  const handleSave = () => {
    setSystemPrompt(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(systemPrompt);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        margin:          "0 16px 8px",
        backgroundColor: "var(--bg-2)",
        border:          "1px solid var(--border-s)",
        borderRadius:    "var(--r-lg)",
        overflow:        "hidden",
        boxShadow:       "var(--shadow-sm)",
      }}
    >
      {/* Header / Summary row */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "8px 12px",
          cursor:         "pointer",
          userSelect:     "none",
        }}
        onClick={() => setIsEditing(!isEditing)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 13, color: "var(--ink-4)", fontWeight: 600, letterSpacing: "0.02em" }}>
            SYSTEM PROMPT
          </span>
          {!isEditing && (
            <span
              style={{
                fontSize:     13,
                color:        "var(--ink-3)",
                whiteSpace:   "nowrap",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                maxWidth:     400,
              }}
            >
              {systemPrompt || "None set"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-4)" }}>
          <EditIcon />
          <ChevronIcon expanded={isEditing} />
        </div>
      </div>

      {/* Expandable Editor */}
      <AnimatePresence initial={false}>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--border)" }}>
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="You are a helpful assistant..."
                rows={4}
                autoFocus
                style={{
                  width:           "100%",
                  backgroundColor: "var(--bg-1)",
                  border:          "1px solid var(--border-s)",
                  borderRadius:    "var(--r-md)",
                  color:           "var(--ink)",
                  fontSize:        14,
                  lineHeight:      1.6,
                  padding:         "8px 10px",
                  marginTop:       12,
                  resize:          "vertical",
                  outline:         "none",
                  boxSizing:       "border-box",
                  fontFamily:      "inherit",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                  style={{
                    fontSize: 13,
                    color: "var(--ink-3)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    background: "none",
                    border: "none"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  style={{
                    fontSize:        13,
                    fontWeight:      600,
                    backgroundColor: "var(--accent)",
                    color:           "white",
                    padding:         "4px 14px",
                    borderRadius:    "var(--r-sm)",
                    cursor:          "pointer",
                    border:          "none"
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
