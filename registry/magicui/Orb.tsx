"use client";

import React, { useEffect, useRef } from "react";

// ============================================================
// Orb — Animated WebGL-style canvas orb with glow effect.
// Lightweight, CSS-only — no WebGL required.
// ============================================================

interface OrbProps {
  hoverIntensity?:   number;
  rotateOnHover?:    boolean;
  hue?:              number;
  forceHoverState?:  boolean;
  backgroundColor?:  string;
  className?:         string;
  style?:             React.CSSProperties;
}

export default function Orb({
  hoverIntensity  = 0.6,
  rotateOnHover   = true,
  hue             = 260,
  forceHoverState = false,
  backgroundColor = "transparent",
  className       = "",
  style,
}: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const hoverRef  = useRef(forceHoverState);
  const angleRef  = useRef(0);

  useEffect(() => {
    hoverRef.current = forceHoverState;
  }, [forceHoverState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    if (!ctx)    return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let intensity = forceHoverState ? hoverIntensity : 0.3;

    const tick = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Smooth intensity transition
      const target = hoverRef.current ? hoverIntensity : 0.3;
      intensity += (target - intensity) * 0.06;

      if (rotateOnHover && hoverRef.current) {
        angleRef.current += 0.012;
      } else {
        angleRef.current += 0.004;
      }

      ctx.clearRect(0, 0, W, H);

      const r = Math.min(W, H) * 0.45;

      // Core gradient
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   `hsla(${hue}, 90%, 70%, ${intensity})`);
      grad.addColorStop(0.4, `hsla(${hue + 20}, 80%, 60%, ${intensity * 0.7})`);
      grad.addColorStop(0.8, `hsla(${hue + 40}, 70%, 40%, ${intensity * 0.3})`);
      grad.addColorStop(1,   `hsla(${hue}, 60%, 20%, 0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Rotating highlight
      const hx = cx + Math.cos(angleRef.current) * r * 0.3;
      const hy = cy + Math.sin(angleRef.current) * r * 0.3;
      const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.6);
      hGrad.addColorStop(0, `hsla(${hue - 20}, 100%, 80%, ${intensity * 0.5})`);
      hGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = hGrad;
      ctx.fill();

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    const handleEnter = () => { hoverRef.current = true; };
    const handleLeave = () => { hoverRef.current = false; };
    canvas.addEventListener("mouseenter", handleEnter);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mouseenter", handleEnter);
      canvas.removeEventListener("mouseleave", handleLeave);
      ro.disconnect();
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width:  "100%",
        height: "100%",
        display:"block",
        backgroundColor,
        ...style,
      }}
    />
  );
}
