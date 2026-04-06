"use client";

import React from "react";
import { motion } from "framer-motion";
import { SkeletonLine } from "./SkeletonLine";

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{   opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{
        padding:         20,
        borderRadius:    "var(--r-lg)",
        backgroundColor: "var(--bg-1)",
        boxShadow:       "var(--shadow-md)",
        display:         "flex",
        flexDirection:   "column",
        gap:             16,
        minHeight:       320,
      }}
      aria-hidden="true"
      aria-label="Loading response…"
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Color dot placeholder */}
        <div
          style={{
            width:           10,
            height:          10,
            borderRadius:    "50%",
            backgroundColor: "var(--bg-3)",
            flexShrink:      0,
          }}
        />
        <SkeletonLine width={110} height={12} />
        <SkeletonLine width={48}  height={12} />
      </div>

      {/* ── Body lines ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="84%"  height={14} />
        <SkeletonLine width="71%"  height={14} />
        <SkeletonLine width="91%"  height={14} />
        <SkeletonLine width="58%"  height={14} />
        <SkeletonLine width="76%"  height={14} />
        <SkeletonLine width="43%"  height={14} />
      </div>

      {/* ── Metrics footer placeholders ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLine key={i} width="100%" height={36} />
        ))}
      </div>
    </motion.div>
  );
}