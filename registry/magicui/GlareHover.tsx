"use client";

import React, { useRef, useState } from "react";

// ============================================================
// GlareHover — Applies a sweeping glare/shine on hover.
// ============================================================

interface GlareHoverProps {
  children?:          React.ReactNode;
  glareColor?:        string;
  glareOpacity?:      number;
  glareAngle?:        number; // degrees
  glareSize?:         number; // px width of glare beam
  transitionDuration?: number; // ms
  playOnce?:          boolean;
  className?:         string;
  style?:             React.CSSProperties;
}

export default function GlareHover({
  children,
  glareColor        = "#ffffff",
  glareOpacity      = 0.25,
  glareAngle        = -30,
  glareSize         = 280,
  transitionDuration = 700,
  className         = "",
  style,
}: GlareHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos,   setPos]   = useState({ x: 50, y: 50 }); // % within element
  const [hover, setHover] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:  "relative",
        overflow:  "hidden",
        willChange:"transform",
        ...style,
      }}
    >
      {/* Glare overlay */}
      <div
        aria-hidden="true"
        style={{
          position:        "absolute",
          inset:           0,
          pointerEvents:   "none",
          zIndex:          10,
          opacity:         hover ? glareOpacity : 0,
          transition:      `opacity ${transitionDuration}ms ease-out`,
          background: `linear-gradient(
            ${glareAngle}deg,
            transparent 0%,
            ${glareColor} 45%,
            transparent 55%
          )`,
          backgroundSize:     `${glareSize}px 100%`,
          backgroundPosition: hover ? `${pos.x}% ${pos.y}%` : "-100% 0",
          backgroundRepeat:   "no-repeat",
        }}
      />

      {children}
    </div>
  );
}
