"use client";

import React, { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

const STATS = [
  { value: 11,  label: "Models Supported",    suffix: "" },
  { value: 4,   label: "Export Formats",       suffix: "" },
  { value: 3,   label: "Built-in Tools",       suffix: "" },
  { value: null, label: "Real-time Streaming", suffix: "∞" },
];

interface StatItemProps {
  value:   number | null;
  label:   string;
  suffix:  string;
}

function StatItem({ value, label, suffix }: StatItemProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(numRef, { once: true, margin: "-15%" });

  useEffect(() => {
    if (value === null || !isInView || !numRef.current) return;

    const node = numRef.current;
    
    // Animate from 0 to target value 
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate(cur) {
        node.textContent = Math.round(cur).toString();
      },
    });

    return controls.stop;
  }, [value, isInView]);

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            6,
        padding:        "0 16px",
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize:   "clamp(28px, 4vw, 42px)",
          color:      "var(--accent-hi)",
          lineHeight: 1,
          fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
        }}
      >
        {value === null ? (
          suffix
        ) : (
          <>
            <span ref={numRef}>0</span>
            {suffix}
          </>
        )}
      </span>
      <span
        style={{
          fontSize:   15,
          color:      "var(--ink-3)",
          fontWeight: 500,
          textAlign:  "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function StatsBar() {
  return (
    <div
      style={{
        borderTop:    "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg-1)",
        padding:      "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth:            900,
          margin:              "0 auto",
          display:             "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap:                 24,
        }}
      >
        {STATS.map((stat, i) => (
          <StatItem key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}