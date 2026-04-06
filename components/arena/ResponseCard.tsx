"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ToolCallBadge } from "@/components/tool-calling/ToolCallBadge";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/lib/models";
import type { CardState, MetricsData, ToolCallResult } from "@/types";

// ============================================================
// TYPES
// ============================================================

interface ResponseCardProps {
  modelId:      string;
  modelColor:   string;
  state:        CardState;
  text:         string;
  metrics:      MetricsData | null;
  toolCall:     ToolCallResult | null;
  onRetry:      () => void;
  onCopy:       () => void;
}

// ============================================================
// ICONS (inline SVG — no external deps)
// ============================================================

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const RetryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);

// ============================================================
// STATE PILL
// ============================================================

function StatePill({ state }: { state: CardState }) {
  if (state === "idle" || state === "loading") return null;

  const map: Record<string, { label: string; color: string; bg: string; pulse?: boolean }> = {
    streaming: { label: "STREAMING", color: "var(--amber)", bg: "color-mix(in srgb, var(--amber) 15%, transparent)", pulse: true },
    done:      { label: "DONE",      color: "var(--green)", bg: "color-mix(in srgb, var(--green) 15%, transparent)" },
    error:     { label: "ERROR",     color: "var(--red)",   bg: "color-mix(in srgb, var(--red)   15%, transparent)" },
    cancelled: { label: "CANCELLED", color: "var(--ink-4)", bg: "var(--bg-3)" },
  };

  const cfg = map[state];
  if (!cfg) return null;

  return (
    <span
      style={{
        fontFamily:      "var(--font-jetbrains-mono), monospace",
        fontSize:        10,
        fontWeight:      600,
        letterSpacing:   "0.08em",
        color:           cfg.color,
        backgroundColor: cfg.bg,
        padding:         "2px 7px",
        borderRadius:    "var(--r-full)",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ============================================================
// METRIC BLOCK
// ============================================================

function MetricBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-2)",
        borderRadius:    "var(--r-sm)",
        padding:         "7px 10px",
        flex:            1,
        minWidth:        0,
        textAlign:       "center",
      }}
    >
      <div
        style={{
          fontFamily:    "var(--font-jetbrains-mono), monospace",
          fontSize:      10,
          color:         "var(--ink-4)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom:  3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize:   13,
          fontWeight: 600,
          color:      color ?? "var(--ink)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ResponseCard({
  modelId,
  modelColor,
  state,
  text,
  metrics,
  toolCall,
  onRetry,
  onCopy,
}: ResponseCardProps) {
  const [hovered, setHovered] = useState(false);
  const model = MODELS.find((m) => m.id === modelId);
  const isStreaming = state === "streaming";

  // Shake animation for error state
  const shakeVariants = {
    idle:  { x: 0 },
    shake: { x: [0, -6, 6, -4, 4, -2, 2, 0] },
  };
  const shakeRef = useRef<"idle" | "shake">("idle");

  // Show skeleton while loading
  if (state === "loading") {
    return <SkeletonCard />;
  }

  const fmt = {
    ttft:    metrics?.ttft    != null ? `${metrics.ttft}ms`              : "—",
    tps:     metrics?.tps     != null ? `${metrics.tps}`                 : "—",
    tokens:  metrics?.tokens  != null ? `${metrics.tokens}`              : "—",
    latency: metrics?.latency != null ? `${metrics.latency}ms`           : "—",
    tool:    metrics?.tool                                               ?? "—",
  };

  const toolColor =
    fmt.tool === "✓" ? "var(--green)" :
    fmt.tool === "✗" ? "var(--red)"   : "var(--ink-4)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={
        state === "error"
          ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, -2, 2, 0] }
          : { opacity: 1, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        opacity:   { duration: 0.3,  ease: "easeOut" },
        y:         { duration: 0.3,  ease: "easeOut" },
        x:         { duration: 0.32, ease: "easeOut" },
      }}
      whileHover={{ y: -2, transition: { duration: 0.15, ease: "easeOut" } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()   => setHovered(false)}
      style={{
        position:        "relative",
        display:         "flex",
        flexDirection:   "column",
        backgroundColor: "var(--bg-1)",
        borderRadius:    "var(--r-lg)",
        boxShadow:       hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
        borderLeft:      `3px solid ${modelColor}`,
        padding:         20,
        minHeight:       320,
        overflow:        "hidden",
        transition:      "box-shadow 150ms ease-out",
        willChange:      isStreaming ? "transform" : "auto",
      }}
    >
      {/* ── Streaming progress bar ── */}
      {isStreaming && (
        <div
          style={{
            position:        "absolute",
            bottom:          0,
            left:            0,
            right:           0,
            height:          2,
            backgroundColor: "var(--bg-2)",
          }}
        >
          <motion.div
            animate={{ width: `${Math.min((metrics?.tokens ?? 0) / 4, 100)}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              height:          "100%",
              backgroundColor: modelColor,
              borderRadius:    "0 2px 2px 0",
            }}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            8,
          marginBottom:   12,
        }}
      >
        {/* Left: dot + name + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {/* Color dot */}
          <div
            style={{
              width:           10,
              height:          10,
              borderRadius:    "50%",
              backgroundColor: modelColor,
              flexShrink:      0,
              boxShadow:       `0 0 6px ${modelColor}55`,
            }}
          />
          {/* Model name */}
          <span
            style={{
              fontWeight:   700,
              fontSize:     15,
              color:        "var(--ink)",
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {model?.label ?? modelId}
          </span>
          {/* Size badge */}
          {model?.sizeLabel && (
            <span
              style={{
                fontFamily:    "var(--font-jetbrains-mono), monospace",
                fontSize:      11,
                color:         "var(--ink-3)",
                backgroundColor: "var(--bg-2)",
                padding:       "2px 6px",
                borderRadius:  "var(--r-xs)",
                letterSpacing: "0.08em",
                flexShrink:    0,
              }}
            >
              {model.sizeLabel}
            </span>
          )}
          <StatePill state={state} />
        </div>

        {/* Right: action buttons (visible on hover) */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: "flex", gap: 4, flexShrink: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            leftIcon={<CopyIcon />}
            aria-label="Copy response"
            title="Copy"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            leftIcon={<RetryIcon />}
            aria-label="Retry this model"
            title="Retry"
          />
        </motion.div>
      </div>

      {/* ── Tool call badge ── */}
      <AnimatePresence>
        {toolCall && <ToolCallBadge toolCall={toolCall} />}
      </AnimatePresence>

      {/* ── Body ── */}
      <div
        style={{
          flex:        1,
          overflowY:   "auto",
          marginBottom: 12,
        }}
        aria-live={isStreaming ? "polite" : undefined}
        aria-atomic="false"
      >
        {state === "error" && (
          <div
            style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              height:         "100%",
              gap:            12,
              color:          "var(--red)",
              fontSize:       15,
            }}
          >
            <span>⚠ An error occurred</span>
            <Button variant="danger" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {state === "cancelled" && (
          <p style={{ color: "var(--ink-4)", fontSize: 15, fontStyle: "italic" }}>
            Run cancelled.
          </p>
        )}

        {(state === "streaming" || state === "done") && (
          <p
            style={{
              fontFamily:  "var(--font-plus-jakarta-sans), sans-serif",
              fontSize:    16,
              lineHeight:  1.7,
              color:       "var(--ink-2)",
              whiteSpace:  "pre-wrap",
              wordBreak:   "break-word",
              margin:      0,
            }}
          >
            {text}
            {/* Blinking cursor while streaming */}
            {isStreaming && (
              <span
                aria-hidden="true"
                style={{
                  display:    "inline-block",
                  width:      2,
                  height:     "1em",
                  backgroundColor: "var(--accent)",
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                  animation:  "blink-cursor 0.7s step-end infinite",
                }}
              />
            )}
          </p>
        )}
      </div>

      {/* ── Metrics footer ── */}
      <div
        style={{
          display:       "flex",
          gap:           6,
          paddingTop:    12,
          borderTop:     "1px solid var(--border)",
          marginTop:     "auto",
        }}
      >
        <MetricBlock label="TTFT"    value={fmt.ttft} />
        <MetricBlock label="TPS"     value={fmt.tps} />
        <MetricBlock label="TOKENS"  value={fmt.tokens} />
        <MetricBlock label="LATENCY" value={fmt.latency} />
        <MetricBlock label="TOOL"    value={fmt.tool} color={toolColor} />
      </div>
    </motion.div>
  );
}