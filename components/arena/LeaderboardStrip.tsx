"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODELS } from "@/lib/models";
import type { RunResult } from "@/types";

// ============================================================
// TYPES
// ============================================================

interface LeaderboardStripProps {
  results: Record<string, RunResult>;
  visible: boolean;
}

// ============================================================
// RANK BADGE
// ============================================================

function RankBadge({ rank }: { rank: number }) {
  const style: React.CSSProperties = {
    fontFamily:  "var(--font-jetbrains-mono), monospace",
    fontWeight:  800,
    fontSize:    15,
    width:       28,
    textAlign:   "center",
    flexShrink:  0,
  };

  if (rank === 1) return <span style={{ ...style, color: "var(--amber)" }}>🥇</span>;
  if (rank === 2) return <span style={{ ...style, color: "var(--ink-3)" }}>🥈</span>;
  if (rank === 3) return <span style={{ ...style, color: "#cd7f32"     }}>🥉</span>;
  return (
    <span style={{ ...style, color: "var(--ink-4)" }}>
      #{rank}
    </span>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function LeaderboardStrip({ results, visible }: LeaderboardStripProps) {
  const [collapsed, setCollapsed] = useState(false);

  const sorted = Object.values(results)
    .filter((r) => !r.cancelled && r.metrics?.tps != null)
    .sort((a, b) => (b.metrics?.tps ?? 0) - (a.metrics?.tps ?? 0));

  if (sorted.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="leaderboard"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{    height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              padding:       "16px 16px 8px",
              borderTop:     "1px solid var(--border)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                marginBottom:   collapsed ? 0 : 12,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize:   15,
                  color:      "var(--ink)",
                }}
              >
                Results
              </span>
              <button
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand leaderboard" : "Collapse leaderboard"}
                style={{
                  background:   "none",
                  border:       "none",
                  cursor:       "pointer",
                  color:        "var(--ink-4)",
                  fontSize:     18,
                  lineHeight:   1,
                  padding:      "2px 6px",
                  borderRadius: "var(--r-xs)",
                  transition:   "transform 200ms ease-out",
                  transform:    collapsed ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ⌃
              </button>
            </div>

            {/* Rows */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{    opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display:       "flex",
                    flexDirection: "column",
                    gap:           8,
                    paddingBottom: 8,
                  }}
                >
                  {sorted.map((result, idx) => {
                    const rank  = idx + 1;
                    const model = MODELS.find((m) => m.id === result.modelId);
                    const isWinner = rank === 1;

                    return (
                      <motion.div
                        key={result.modelId}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0   }}
                        transition={{
                          duration: 0.28,
                          ease:     "easeOut",
                          delay:    idx * 0.05,
                        }}
                        style={{
                          display:         "flex",
                          alignItems:      "center",
                          gap:             12,
                          padding:         "10px 14px",
                          borderRadius:    "var(--r-md)",
                          backgroundColor: "var(--bg-1)",
                          boxShadow:       isWinner
                            ? "var(--shadow-glow), var(--shadow-sm)"
                            : "var(--shadow-sm)",
                          border:          isWinner
                            ? "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
                            : "1px solid transparent",
                        }}
                      >
                        {/* Rank */}
                        <RankBadge rank={rank} />

                        {/* Color dot + name */}
                        <div
                          style={{
                            width:           8,
                            height:          8,
                            borderRadius:    "50%",
                            backgroundColor: model?.color ?? "var(--ink-4)",
                            flexShrink:      0,
                          }}
                        />
                        <span
                          style={{
                            fontSize:   14,
                            fontWeight: 600,
                            color:      "var(--ink)",
                            flex:       1,
                            minWidth:   0,
                            overflow:   "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {model?.label ?? result.modelId}
                        </span>

                        {/* TPS — main metric */}
                        <div
                          style={{
                            display:    "flex",
                            alignItems: "baseline",
                            gap:        3,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize:   22,
                              fontWeight: 700,
                              color:      isWinner ? "var(--accent-hi)" : "var(--ink)",
                            }}
                          >
                            {result.metrics?.tps ?? "—"}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              fontSize:   11,
                              color:      "var(--ink-4)",
                            }}
                          >
                            tps
                          </span>
                        </div>

                        {/* Secondary: TTFT + Tokens */}
                        <div
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize:   12,
                            color:      "var(--ink-4)",
                            textAlign:  "right",
                            minWidth:   90,
                            display:    "flex",
                            flexDirection: "column",
                            gap:        2,
                          }}
                        >
                          <span>TTFT {result.metrics?.ttft ?? "—"}ms</span>
                          <span>{result.metrics?.tokens ?? "—"} tok</span>
                        </div>

                        {/* Tool chip */}
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize:   13,
                            fontWeight: 700,
                            color:
                              result.metrics?.tool === "✓" ? "var(--green)" :
                              result.metrics?.tool === "✗" ? "var(--red)"   : "var(--ink-4)",
                            minWidth: 16,
                            textAlign: "center",
                          }}
                        >
                          {result.metrics?.tool ?? "—"}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}