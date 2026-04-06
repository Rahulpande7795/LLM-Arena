"use client";

import { useEffect } from "react";
import type { ShortcutKey } from "@/types";

type ShortcutHandlers = Partial<Record<ShortcutKey, () => void>>;

// Tags where we should NOT fire shortcuts
const SKIP_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * Registers global keyboard shortcuts.
 * All handlers are skipped when focus is inside an input / textarea.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const inInput = isTypingTarget(e.target);

      // ── Ctrl + Enter → run ──────────────────────────────
      if (ctrl && e.key === "Enter") {
        e.preventDefault();
        handlers.run?.();
        return;
      }

      // ── Ctrl + K → templates ───────────────────────────
      if (ctrl && e.key === "k") {
        e.preventDefault();
        handlers.templates?.();
        return;
      }

      // ── Ctrl + E → export ──────────────────────────────
      if (ctrl && e.key === "e") {
        e.preventDefault();
        handlers.export?.();
        return;
      }

      // ── Ctrl + L → clear ───────────────────────────────
      if (ctrl && e.key === "l") {
        e.preventDefault();
        handlers.clear?.();
        return;
      }

      // ── Ctrl + / → shortcuts dialog ────────────────────
      if (ctrl && e.key === "/") {
        e.preventDefault();
        handlers.shortcuts?.();
        return;
      }

      // ── Escape → cancel / close ─────────────────────────
      if (e.key === "Escape") {
        handlers.escape?.();
        return;
      }

      // ── Single-key shortcuts (skip when typing) ──────────
      if (inInput || ctrl) return;

      if (e.key === "t" || e.key === "T") {
        handlers.theme?.();
        return;
      }

      if (e.key === "f" || e.key === "F") {
        handlers.fullscreen?.();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);
}