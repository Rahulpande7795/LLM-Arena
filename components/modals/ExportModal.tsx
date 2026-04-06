"use client";

import React from "react";
import { ModalOverlay } from "./ModalOverlay";
import { useToast } from "@/components/ui/ToastContainer";
import { exportJSON, exportCSV, exportMarkdown, exportText } from "@/lib/export";
import type { RunResult } from "@/types";

// ============================================================
// FORMAT CONFIG
// ============================================================

const FORMATS = [
  {
    id:    "json",
    icon:  "{ }",
    label: "JSON",
    desc:  "Full data + metrics",
  },
  {
    id:    "csv",
    icon:  "≡",
    label: "CSV",
    desc:  "Spreadsheet ready",
  },
  {
    id:    "markdown",
    icon:  "#",
    label: "Markdown",
    desc:  "Docs & reports",
  },
  {
    id:    "text",
    icon:  "Aa",
    label: "Plain Text",
    desc:  "Simple & portable",
  },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];

// ============================================================
// TYPES
// ============================================================

interface ExportModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  results:   RunResult[];
  prompt:    string;
  timestamp: number;
}

// ============================================================
// COMPONENT
// ============================================================

export function ExportModal({
  isOpen,
  onClose,
  results,
  prompt,
  timestamp,
}: ExportModalProps) {
  const toast   = useToast();
  const hasData = results.length > 0;

  function handleExport(formatId: FormatId) {
    if (!hasData) return;

    const payload = { prompt, timestamp, results };

    try {
      switch (formatId) {
        case "json":     exportJSON(payload);     break;
        case "csv":      exportCSV(payload);      break;
        case "markdown": exportMarkdown(payload); break;
        case "text":     exportText(payload);     break;
      }
      toast.success(`Exported as ${formatId.toUpperCase()}`);
      onClose();
    } catch {
      toast.error("Export failed — try again");
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Export Results"
      size="sm"
    >
      {!hasData ? (
        <div
          style={{
            textAlign: "center",
            padding:   "24px 0",
            color:     "var(--ink-3)",
            fontSize:  15,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          Run a benchmark first to export results.
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize:     13,
              color:        "var(--ink-4)",
              marginBottom: 16,
              marginTop:    0,
            }}
          >
            {results.length} model{results.length !== 1 ? "s" : ""} · choose a format to download
          </p>

          {/* 2×2 grid */}
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 10,
            }}
          >
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id)}
                style={{
                  display:         "flex",
                  flexDirection:   "column",
                  alignItems:      "center",
                  gap:             8,
                  padding:         "18px 12px",
                  backgroundColor: "var(--bg-2)",
                  border:          "1.5px solid var(--border)",
                  borderRadius:    "var(--r-lg)",
                  cursor:          "pointer",
                  transition:      "all 120ms ease-out",
                  textAlign:       "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "var(--bg-3)";
                  el.style.borderColor     = "var(--accent)";
                  el.style.transform       = "translateY(-1px)";
                  el.style.boxShadow       = "var(--shadow-sm)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "var(--bg-2)";
                  el.style.borderColor     = "var(--border)";
                  el.style.transform       = "translateY(0)";
                  el.style.boxShadow       = "none";
                }}
              >
                {/* Icon */}
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize:   22,
                    fontWeight: 700,
                    color:      "var(--accent-hi)",
                    lineHeight: 1,
                  }}
                >
                  {fmt.icon}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontWeight: 700,
                    fontSize:   14,
                    color:      "var(--ink)",
                  }}
                >
                  {fmt.label}
                </span>

                {/* Description */}
                <span
                  style={{
                    fontSize:   12,
                    color:      "var(--ink-4)",
                    lineHeight: 1.4,
                  }}
                >
                  {fmt.desc}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </ModalOverlay>
  );
}