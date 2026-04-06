"use client";

import React from "react";
import { useArenaStore } from "@/hooks/useArenaStore";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/lib/models";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function HistoryView() {
  const history = useArenaStore((s) => s.history);
  const clearResults = useArenaStore((s) => s.clearResults);

  if (history.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 64, textAlign: "center" }}>
        <p style={{ fontSize: 17, color: "var(--ink-3)", margin: 0 }}>No runs yet.</p>
        <p style={{ fontSize: 14, color: "var(--ink-4)", marginTop: 8 }}>Head to Compare to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, color: "var(--ink)" }}>Run History</h2>
        <Button variant="danger" size="sm" onClick={clearResults}>Clear</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {history.map((entry) => {
          const bestTPS = Math.max(...Object.values(entry.results).map((r) => r.metrics?.tps ?? 0));
          const avgTTFT = Math.round(
            Object.values(entry.results).reduce((s, r) => s + (r.metrics?.ttft ?? 0), 0) /
            Math.max(Object.keys(entry.results).length, 1)
          );

          return (
            <div
              key={entry.id}
              style={{
                backgroundColor: "var(--bg-1)",
                borderRadius:    "var(--r-lg)",
                boxShadow:       "var(--shadow-sm)",
                padding:         "14px 16px",
                borderLeft:      "3px solid transparent",
                transition:      "background-color 120ms ease-out, border-left-color 120ms ease-out",
                cursor:          "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-2)";
                (e.currentTarget as HTMLElement).style.borderLeftColor  = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-1)";
                (e.currentTarget as HTMLElement).style.borderLeftColor  = "transparent";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "var(--ink-4)" }}>
                  {relativeTime(entry.timestamp)}
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "var(--ink-4)" }}>
                  {entry.models.length} model{entry.models.length !== 1 ? "s" : ""}
                </span>
              </div>

              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.prompt}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "var(--green)" }}>
                  ↑ {bestTPS} tps
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: "var(--ink-3)" }}>
                  {avgTTFT}ms ttft
                </span>
                <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                  {entry.models.slice(0, 4).map((id) => {
                    const m = MODELS.find((mo) => mo.id === id);
                    return m ? (
                      <span key={id} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: m.color, display: "inline-block" }} title={m.label} />
                    ) : null;
                  })}
                  {entry.models.length > 4 && (
                    <span style={{ fontSize: 11, color: "var(--ink-4)" }}>+{entry.models.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}