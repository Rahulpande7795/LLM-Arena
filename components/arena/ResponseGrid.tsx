"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResponseCard } from "./ResponseCard";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { useLayout } from "@/hooks/useLayout";
import type { ModelConfig, CardState, MetricsData, ToolCallResult, RunResult } from "@/types";
// import GlareHover from "@/components/ui/GlareHover";

// ============================================================
// TYPES
// ============================================================

interface ResponseGridProps {
  models:     ModelConfig[];
  cardStates: Record<string, CardState>;
  texts:      Record<string, string>;
  metrics:    Record<string, MetricsData | null>;
  toolCalls:  Record<string, ToolCallResult | null>;
  results:    Record<string, RunResult>;
  onRetry:    (modelId: string) => void;
  onCopy:     (modelId: string) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function ResponseGrid({
  models,
  cardStates,
  texts,
  metrics,
  toolCalls,
  onRetry,
  onCopy,
}: ResponseGridProps) {
  const { gridTemplateColumns } = useLayout(models.length);

  // No models selected at all
  if (models.length === 0) {
    return <EmptyState />;
  }

  // All models idle (no run yet)
  const anyActive = models.some((m) => {
    const s = cardStates[m.id];
    return s && s !== "idle";
  });

  if (!anyActive) {
    return <EmptyState />;
  }

  return (
    <div
      style={{
        display:               "grid",
        gridTemplateColumns,
        gap:                   16,
        padding:               "16px 16px 160px", // bottom pad for PromptBar
        alignItems:            "start",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {models.map((model, i) => {
          const state    = cardStates[model.id] ?? "idle";
          const text     = texts[model.id]     ?? "";
          const metric   = metrics[model.id]   ?? null;
          const toolCall = toolCalls[model.id] ?? null;

          return (
            <motion.div
              key={model.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.3,
                ease:     "easeOut",
                delay:    i * 0.04, // subtle stagger
              }}
            >
              {state === "loading" ? (
                <SkeletonCard />
              ) : (
                <ResponseCard
                  modelId={model.id}
                  modelColor={model.color}
                  state={state}
                  text={text}
                  metrics={metric}
                  toolCall={toolCall}
                  onRetry={() => onRetry(model.id)}
                  onCopy={()  => onCopy(model.id)}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
