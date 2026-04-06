"use client";

import React, { useEffect, useRef } from "react";

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
  index:   number;
}

function StatItem({ value, label, suffix, index }: StatItemProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (value === null) return;

    async function setup() {
      try {
        const gsapMod = await import("gsap");
        const stMod   = await import("gsap/ScrollTrigger");
        const gsap    = gsapMod.default ?? gsapMod;
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
          trigger: numRef.current,
          start:   "top 85%",
          onEnter: () => {
            if (triggered.current) return;
            triggered.current = true;
            const obj = { val: 0 };
            gsap.to(obj, {
              val:      value,
              duration: 1.4,
              ease:     "power2.out",
              onUpdate: () => {
                if (numRef.current) {
                  numRef.current.textContent = Math.round(obj.val).toString();
                }
              },
            });
          },
        });
      } catch {
        // GSAP unavailable — just show the number
        if (numRef.current) numRef.current.textContent = String(value);
      }
    }

    setup();
  }, [value]);

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
          <StatItem key={i} {...stat} index={i} />
        ))}
      </div>
    </div>
  );
}