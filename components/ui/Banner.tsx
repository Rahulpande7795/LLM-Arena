"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

export type BannerType = "info" | "warning" | "error";

interface BannerProps {
  message:      string;
  type?:        BannerType;
  dismissible?: boolean;
  action?:      { label: string; onClick: () => void };
}

// ============================================================
// COLOR MAP
// ============================================================

const typeColor: Record<BannerType, string> = {
  info:    "var(--accent)",
  warning: "var(--amber)",
  error:   "var(--red)",
};

// ============================================================
// COMPONENT
// ============================================================

export function Banner({
  message,
  type        = "info",
  dismissible = true,
  action,
}: BannerProps) {
  const [visible, setVisible] = useState(true);
  const color = typeColor[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y:   0, opacity: 1 }}
          exit={{    y: -40, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="banner"
          style={{
            width:           "100%",
            backgroundColor: "var(--bg-1)",
            borderLeft:      `3px solid ${color}`,
            borderBottom:    "1px solid var(--border)",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "space-between",
            padding:         "10px 16px",
            gap:             12,
            fontSize:        14,
            color:           "var(--ink-2)",
          }}
        >
          <span style={{ flex: 1 }}>{message}</span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {action && (
              <button
                onClick={action.onClick}
                style={{
                  background:   "none",
                  border:       "none",
                  color,
                  fontWeight:   600,
                  fontSize:     13,
                  cursor:       "pointer",
                  padding:      "2px 6px",
                  borderRadius: "var(--r-xs)",
                }}
              >
                {action.label}
              </button>
            )}

            {dismissible && (
              <button
                onClick={() => setVisible(false)}
                aria-label="Dismiss banner"
                style={{
                  background:   "none",
                  border:       "none",
                  color:        "var(--ink-4)",
                  fontSize:     18,
                  lineHeight:   1,
                  cursor:       "pointer",
                  padding:      "0 4px",
                  borderRadius: "var(--r-xs)",
                }}
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}