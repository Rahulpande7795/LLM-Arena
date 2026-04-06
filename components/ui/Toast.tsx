"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id:       string;
  message:  string;
  type:     ToastType;
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

// ============================================================
// COLOR MAP
// ============================================================

const typeColor: Record<ToastType, string> = {
  success: "var(--green)",
  error:   "var(--red)",
  warning: "var(--amber)",
  info:    "var(--accent)",
};

const typeIcon: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

// ============================================================
// COMPONENT
// ============================================================

export function Toast({ id, message, type, duration = 4000, onDismiss }: ToastProps) {
  const color = typeColor[type];

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0,  opacity: 1 }}
      exit={{    x: 16, opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      role="alert"
      aria-live="polite"
      style={{
        position:        "relative",
        display:         "flex",
        alignItems:      "flex-start",
        gap:             10,
        padding:         "12px 16px",
        paddingRight:    36,
        borderRadius:    "var(--r-md)",
        backgroundColor: "var(--bg-1)",
        boxShadow:       "var(--shadow-lg)",
        borderLeft:      `3px solid ${color}`,
        minWidth:        280,
        maxWidth:        380,
        wordBreak:       "break-word",
      }}
    >
      {/* Icon */}
      <span
        aria-hidden="true"
        style={{
          color,
          fontWeight:  700,
          fontSize:    15,
          lineHeight:  1,
          marginTop:   1,
          flexShrink:  0,
        }}
      >
        {typeIcon[type]}
      </span>

      {/* Message */}
      <span
        style={{
          fontSize:   14,
          lineHeight: 1.5,
          color:      "var(--ink-2)",
        }}
      >
        {message}
      </span>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        style={{
          position:        "absolute",
          top:             8,
          right:           8,
          background:      "none",
          border:          "none",
          color:           "var(--ink-4)",
          fontSize:        16,
          lineHeight:      1,
          cursor:          "pointer",
          padding:         "2px 4px",
          borderRadius:    "var(--r-xs)",
        }}
      >
        ×
      </button>
    </motion.div>
  );
}