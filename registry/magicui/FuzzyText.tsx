"use client";

import React, { useEffect, useRef, useState } from "react";

// ============================================================
// FuzzyText — Renders text with a configurable noise/blur effect
// that intensifies on hover.
// ============================================================

interface FuzzyTextProps {
  children:        string | React.ReactNode;
  baseIntensity?:  number; // 0-1 default blur amount
  hoverIntensity?: number; // 0-1 blur on hover
  enableHover?:    boolean;
  fontSize?:       string | number;
  color?:          string;
  className?:      string;
  style?:          React.CSSProperties;
}

export default function FuzzyText({
  children,
  baseIntensity  = 0.22,
  hoverIntensity = 0.5,
  enableHover    = true,
  fontSize,
  color,
  className      = "",
  style,
}: FuzzyTextProps) {
  const [hovered, setHovered] = useState(false);
  const [frame,   setFrame]   = useState(0);
  const rafRef                = useRef<number>(0);
  const activeRef             = useRef(true);

  const intensity = hovered && enableHover ? hoverIntensity : baseIntensity;

  // Animate noise by re-rendering at ~30fps when intensity > 0
  useEffect(() => {
    activeRef.current = true;
    let lastTime = 0;
    const fps = 28;

    const tick = (t: number) => {
      if (!activeRef.current) return;
      if (t - lastTime > 1000 / fps) {
        lastTime = t;
        setFrame((f) => f + 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Generate SVG noise filter with turbulence
  const seed     = frame % 100;
  const baseFx   = intensity * 1.8;

  const filterId = `fuzzy-${seed}`;

  return (
    <span
      className={className}
      onMouseEnter={() => enableHover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    "inline-block",
        position:   "relative",
        cursor:     enableHover ? "default" : undefined,
        fontSize,
        color,
        ...style,
      }}
    >
      {/* Hidden SVG filter */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${baseFx * 0.04} ${baseFx * 0.035}`}
              numOctaves={4}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={intensity * 6}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <span style={{ filter: `url(#${filterId})` }}>
        {children}
      </span>
    </span>
  );
}
