"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

interface MagicBentoProps {
  children?:          React.ReactNode;
  textAutoHide?:      boolean;
  enableStars?:       boolean;
  enableSpotlight?:   boolean;
  enableBorderGlow?:  boolean;
  enableTilt?:        boolean;
  enableMagnetism?:   boolean;
  clickEffect?:       boolean;
  spotlightRadius?:   number;
  particleCount?:     number;
  glowColor?:         string; // "r, g, b"
  disableAnimations?: boolean;
  className?:         string;
}

// ============================================================
// STAR particle
// ============================================================

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    size:  Math.random() * 2.5 + 0.5,
    delay: Math.random() * 3,
    dur:   Math.random() * 2 + 1.5,
  }));
}

// ============================================================
// MAGIC BENTO
// ============================================================

export default function MagicBento({
  children,
  enableStars        = true,
  enableSpotlight    = true,
  enableBorderGlow   = true,
  clickEffect        = true,
  spotlightRadius    = 400,
  particleCount      = 12,
  glowColor          = "139, 92, 246",
  disableAnimations  = false,
  className          = "",
}: MagicBentoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [clicked,  setClicked]  = useState<{ x: number; y: number } | null>(null);
  const [stars]                 = useState(() => generateStars(particleCount));

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disableAnimations) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [disableAnimations]);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -999, y: -999 });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect || disableAnimations) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setClicked({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setClicked(null), 700);
  }, [clickEffect, disableAnimations]);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        position:      "relative",
        overflow:      "hidden",
        backgroundColor: "var(--bg-1)",
        borderRadius:  "var(--r-2xl)",
        border:        `1px solid var(--border-s)`,
        boxShadow:     enableBorderGlow
          ? `var(--shadow-lg), 0 0 0 1px rgba(${glowColor}, 0.15), inset 0 0 80px rgba(${glowColor}, 0.04)`
          : "var(--shadow-lg)",
        padding:       32,
      }}
    >
      {/* Spotlight overlay */}
      {enableSpotlight && !disableAnimations && (
        <div
          style={{
            position:        "absolute",
            inset:           0,
            pointerEvents:   "none",
            zIndex:          0,
            background:      `radial-gradient(circle ${spotlightRadius}px at ${mousePos.x}px ${mousePos.y}px,
              rgba(${glowColor}, 0.12) 0%,
              rgba(${glowColor}, 0.04) 40%,
              transparent 70%)`,
            transition:      "background 0.06s ease-out",
          }}
        />
      )}

      {/* Star particles */}
      {enableStars && !disableAnimations && (
        <div
          style={{
            position:     "absolute",
            inset:        0,
            pointerEvents:"none",
            zIndex:       0,
            overflow:     "hidden",
          }}
        >
          {stars.map((star) => (
            <motion.div
              key={star.id}
              style={{
                position:        "absolute",
                left:            `${star.x}%`,
                top:             `${star.y}%`,
                width:           star.size,
                height:          star.size,
                borderRadius:    "50%",
                backgroundColor: `rgba(${glowColor}, 0.7)`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale:   [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: star.dur,
                delay:    star.delay,
                repeat:   Infinity,
                ease:     "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Click ripple */}
      {clickEffect && clicked && (
        <motion.div
          key={`${clicked.x}-${clicked.y}`}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position:        "absolute",
            left:            clicked.x,
            top:             clicked.y,
            width:           80,
            height:          80,
            borderRadius:    "50%",
            backgroundColor: `rgba(${glowColor}, 0.25)`,
            transform:       "translate(-50%, -50%)",
            pointerEvents:   "none",
            zIndex:          1,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
