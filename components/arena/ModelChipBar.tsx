"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/lib/models";
import type { HealthStatus } from "@/hooks/useModelHealth";

// ============================================================
// TYPES
// ============================================================

interface ModelChipBarProps {
  activeModels: string[];
  health:       Record<string, HealthStatus>;
  onToggle:     (modelId: string) => void;
  onSelectAll:  () => void;
  onSelectNone: () => void;
}

// ============================================================
// HEALTH DOT
// ============================================================

function HealthDot({ status }: { status: HealthStatus }) {
  const color =
    status === "online"   ? "var(--green)" :
    status === "offline"  ? "var(--red)"   :
    status === "checking" ? "var(--amber)" : "var(--ink-4)";

  return (
    <span
      aria-label={`Status: ${status}`}
      style={{
        display:         "inline-block",
        width:           6,
        height:          6,
        borderRadius:    "50%",
        backgroundColor: color,
        flexShrink:      0,
        animation:
          status === "checking"
            ? "pulse-dot 1.5s ease-in-out infinite"
            : "none",
      }}
    />
  );
}

// ============================================================
// CHIP
// ============================================================

function ModelChip({
  modelId,
  active,
  healthStatus,
  onToggle,
}: {
  modelId:      string;
  active:       boolean;
  healthStatus: HealthStatus;
  onToggle:     () => void;
}) {
  const model   = MODELS.find((m) => m.id === modelId);
  const offline = healthStatus === "offline";

  if (!model) return null;

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
      aria-pressed={active}
      aria-label={`${active ? "Deselect" : "Select"} ${model.label}`}
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        gap:             6,
        padding:         "5px 12px",
        borderRadius:    "var(--r-full)",
        border:          `1.5px solid ${
          active
            ? model.color
            : `color-mix(in srgb, ${model.color} 40%, transparent)`
        }`,
        backgroundColor: active
          ? `color-mix(in srgb, ${model.color} 15%, transparent)`
          : "transparent",
        color:           active ? "var(--ink)" : "var(--ink-3)",
        fontSize:        13,
        fontWeight:      active ? 600 : 400,
        cursor:          "pointer",
        whiteSpace:      "nowrap",
        flexShrink:      0,
        opacity:         offline ? 0.45 : 1,
        transition:      "border-color 120ms ease-out, background-color 120ms ease-out",
        textDecoration:  offline ? "line-through" : "none",
        background:      "none",
      }}
    >
      {/* Model color dot */}
      <span
        style={{
          width:           6,
          height:          6,
          borderRadius:    "50%",
          backgroundColor: model.color,
          flexShrink:      0,
        }}
      />
      {model.label}
      <HealthDot status={healthStatus} />
    </motion.button>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function ModelChipBar({
  activeModels,
  health,
  onToggle,
  onSelectAll,
  onSelectNone,
}: ModelChipBarProps) {
  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        gap:             6,
        padding:         "10px 16px",
        overflowX:       "auto",
        scrollbarWidth:  "none",
        borderBottom:    "1px solid var(--border)",
        flexShrink:      0,
      }}
      className="no-scrollbar"
    >
      {/* Model chips */}
      <div
        style={{
          display:  "flex",
          gap:      6,
          flex:     1,
          flexWrap: "nowrap",
        }}
      >
        {MODELS.map((model) => (
          <ModelChip
            key={model.id}
            modelId={model.id}
            active={activeModels.includes(model.id)}
            healthStatus={health[model.id] ?? "unknown"}
            onToggle={() => onToggle(model.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width:           1,
          height:          24,
          backgroundColor: "var(--border-s)",
          flexShrink:      0,
          marginLeft:      4,
        }}
      />

      {/* All / None buttons */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <Button variant="ghost" size="sm" onClick={onSelectAll}>
          All
        </Button>
        <Button variant="ghost" size="sm" onClick={onSelectNone}>
          None
        </Button>
      </div>
    </div>
  );
}