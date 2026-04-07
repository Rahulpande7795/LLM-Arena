"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolCallResult } from "@/types";

// ============================================================
// HELPERS
// ============================================================

function formatArgs(args: Record<string, unknown>): string {
  return Object.values(args)
    .map((v) => String(v))
    .join(", ");
}

function formatResult(toolName: string, result: unknown): string {
  if (!result || typeof result !== "object") return String(result ?? "");
  const r = result as Record<string, unknown>;

  // Handle error responses from real APIs
  if (r.error === true) {
    return `Error: ${String(r.message ?? "Tool failed")}`;
  }

  if (toolName === "get_commodity_price") {
    const price = typeof r.price === "number"
      ? r.price.toLocaleString("en-US", {
          minimumFractionDigits:  2,
          maximumFractionDigits:  2,
        })
      : r.price;
    return `${String(r.commodity ?? "").toUpperCase()}: ${r.currency} ${price} / troy oz`;
  }

  if (toolName === "get_weather") {
    return `${r.city}: ${r.temperature}°${r.unit === "fahrenheit" ? "F" : "C"} · ${r.condition} · Humidity ${r.humidity}%`;
  }

  if (toolName === "get_exchange_rate") {
    return `1 ${r.from} = ${r.rate} ${r.to}`;
  }

  return JSON.stringify(result);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ============================================================
// COMPONENT
// ============================================================

interface ToolCallBadgeProps {
  toolCall: ToolCallResult;
}

export function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  const { toolName, args, result, status, timestamp } = toolCall;

  return (
    <AnimatePresence>
      <motion.div
        key="tool-badge"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{   height: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        style={{ overflow: "hidden" }}
      >
        <div
          style={{
            margin:          "8px 0",
            padding:         "10px 14px",
            borderRadius:    "var(--r-md)",
            backgroundColor: "var(--bg-2)",
            border:          "1px solid var(--border)",
          }}
        >
          {/* ── Running ── */}
          {status === "running" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Pulsing amber dot */}
              <span
                style={{
                  display:         "inline-block",
                  width:           8,
                  height:          8,
                  borderRadius:    "50%",
                  backgroundColor: "var(--amber)",
                  flexShrink:      0,
                  animation:       "pulse-dot 1.5s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize:   13,
                  color:      "var(--amber)",
                }}
              >
                Calling {toolName}({formatArgs(args as Record<string, unknown>)})…
              </span>
            </div>
          )}

          {/* ── Done ── */}
          {status === "done" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              {/* Green check */}
              <span
                style={{
                  color:      "var(--green)",
                  fontWeight: 700,
                  fontSize:   15,
                  flexShrink: 0,
                  marginTop:  1,
                }}
              >
                ✓
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily:  "var(--font-jetbrains-mono), monospace",
                    fontSize:    13,
                    color:       "var(--green)",
                    fontWeight:  600,
                    marginBottom: 2,
                  }}
                >
                  {toolName}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize:   13,
                    color:      "var(--ink-2)",
                    wordBreak:  "break-word",
                  }}
                >
                  {formatResult(toolName, result)}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize:   11,
                    color:      "var(--ink-4)",
                    marginTop:  4,
                  }}
                >
                  {formatTime(timestamp)}
                </div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  color:      "var(--red)",
                  fontWeight: 700,
                  fontSize:   15,
                  flexShrink: 0,
                }}
              >
                ✕
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize:   13,
                  color:      "var(--red)",
                }}
              >
                Tool call failed
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}