"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { create } from "zustand";
import { Toast, type ToastData, type ToastType } from "./Toast";
import { generateId } from "@/lib/uuid";

// ============================================================
// ZUSTAND TOAST STORE  (not persisted — session only)
// ============================================================

interface ToastStore {
  toasts: ToastData[];
  addToast:    (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: generateId() },
      ].slice(-6), // max 6 toasts visible
    })),

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}));

// ============================================================
// useToast HOOK  — convenience API
// ============================================================

export function useToast() {
  const { addToast } = useToastStore();

  const show = (type: ToastType) =>
    (message: string, duration?: number) =>
      addToast({ type, message, duration });

  return {
    success: show("success"),
    error:   show("error"),
    warning: show("warning"),
    info:    show("info"),
  };
}

// ============================================================
// CONTAINER COMPONENT
// ============================================================

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position:       "fixed",
        bottom:         16,
        right:          16,
        zIndex:         9999,
        display:        "flex",
        flexDirection:  "column-reverse",
        gap:            8,
        paddingBottom:  "env(safe-area-inset-bottom, 0px)",
        pointerEvents:  "none",
      }}
    >
      <AnimatePresence mode="sync" initial={false}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast
              {...toast}
              onDismiss={removeToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}