"use client";

import React, { useRef, useState, useCallback } from "react";

// ============================================================
// BorderGlow — Tracks mouse position and casts a glowing cone
// from the nearest edge toward the cursor.
// ============================================================

interface BorderGlowProps {
  children?:         React.ReactNode;
  edgeSensitivity?:  number;
  glowColor?:        string;   // "r g b" space-separated
  backgroundColor?:  string;
  borderRadius?:     number;
  glowRadius?:       number;
  glowIntensity?:    number;
  coneSpread?:       number;
  animated?:         boolean;
  colors?:           string[];
  className?:        string;
  style?:            React.CSSProperties;
}

export default function BorderGlow({
  children,
  glowColor       = "139 92 246",
  backgroundColor = "var(--bg-1)",
  borderRadius    = 20,
  glowRadius      = 80,
  glowIntensity   = 0.9,
  className       = "",
  style,
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -999, y: -999 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: -999, y: -999 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position:        "relative",
        borderRadius:    borderRadius,
        backgroundColor,
        ...style,
      }}
    >
      {/* Glowing border layer */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         -1,
          borderRadius:  borderRadius + 1,
          pointerEvents: "none",
          background: `radial-gradient(${glowRadius * 2}px circle at ${mouse.x}px ${mouse.y}px,
            rgba(${glowColor}, ${glowIntensity}) 0%,
            rgba(${glowColor}, 0.2) 30%,
            transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Actual border */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          borderRadius:  borderRadius,
          border:        `1px solid rgba(${glowColor}, 0.25)`,
          pointerEvents: "none",
          zIndex:        1,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
