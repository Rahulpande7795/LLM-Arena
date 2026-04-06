"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

export type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalOverlayProps {
  isOpen:    boolean;
  onClose:   () => void;
  title:     string;
  size?:     ModalSize;
  children:  React.ReactNode;
}

const maxWidths: Record<ModalSize, number> = {
  sm: 400,
  md: 540,
  lg: 680,
  xl: 860,
};

// ============================================================
// FOCUS TRAP
// ============================================================

function useFocusTrap(ref: React.RefObject<HTMLDivElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    }

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [isOpen, ref]);
}

// ============================================================
// COMPONENT
// ============================================================

export function ModalOverlay({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}: ModalOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, isOpen);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position:        "fixed",
              inset:           0,
              backgroundColor: "rgba(0,0,0,0.55)",
              zIndex:          50,
            }}
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 10  }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position:        "fixed",
              top:             "50%",
              left:            "50%",
              transform:       "translate(-50%, -50%)",
              zIndex:          51,
              width:           `calc(100% - 32px)`,
              maxWidth:        maxWidths[size],
              maxHeight:       "85dvh",
              display:         "flex",
              flexDirection:   "column",
              backgroundColor: "color-mix(in srgb, var(--bg-1) 92%, transparent)",
              backdropFilter:  "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border:          "1px solid var(--border-x)",
              borderRadius:    "var(--r-2xl)",
              boxShadow:       "var(--shadow-lg)",
              overflow:        "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                padding:        "18px 24px 16px",
                borderBottom:   "1px solid var(--border)",
                flexShrink:     0,
              }}
            >
              <h2
                id="modal-title"
                style={{
                  fontWeight: 700,
                  fontSize:   18,
                  color:      "var(--ink)",
                  margin:     0,
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  background:   "none",
                  border:       "none",
                  color:        "var(--ink-4)",
                  fontSize:     22,
                  lineHeight:   1,
                  cursor:       "pointer",
                  padding:      "2px 6px",
                  borderRadius: "var(--r-xs)",
                  transition:   "color 120ms ease-out",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-4)")}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding:   "20px 24px 24px",
                overflowY: "auto",
                flex:      1,
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}