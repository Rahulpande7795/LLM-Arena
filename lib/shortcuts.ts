import type { ShortcutKey } from "@/types";

export const SHORTCUT_LABELS: Record<
  ShortcutKey,
  { keys: string[]; description: string }
> = {
  run: {
    keys: ["Ctrl", "Enter"],
    description: "Run prompt against all selected models",
  },
  templates: {
    keys: ["Ctrl", "K"],
    description: "Open prompt templates picker",
  },
  export: {
    keys: ["Ctrl", "E"],
    description: "Export results (JSON / CSV / Markdown / Text)",
  },
  clear: {
    keys: ["Ctrl", "L"],
    description: "Clear all responses and reset",
  },
  shortcuts: {
    keys: ["Ctrl", "/"],
    description: "Show this keyboard shortcuts dialog",
  },
  escape: {
    keys: ["Esc"],
    description: "Cancel running inference / close modal",
  },
  theme: {
    keys: ["T"],
    description: "Toggle dark / light theme",
  },
  fullscreen: {
    keys: ["F"],
    description: "Focus / fullscreen the active card",
  },
};