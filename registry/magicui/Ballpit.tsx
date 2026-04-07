"use client";

import React, { useEffect, useRef } from "react";

// ============================================================
// Ballpit — Canvas-based physics simulation of colored balls.
// Uses requestAnimationFrame for smooth 60fps animation.
// ============================================================

interface BallpitProps {
  count?:            number;   // number of balls
  gravity?:          number;   // 0 = weightless, >0 = falls down
  friction?:         number;   // velocity damping (0.99 = low friction)
  wallBounce?:       number;   // 0-1 energy retained on wall bounce
  followCursor?:     boolean;  // balls are attracted to cursor
  ambientIntensity?: number;   // 0-1 base opacity of all balls (default 0.82)
  lightIntensity?:   number;   // shadow blur radius for glow (default 10)
  className?:        string;
  style?:            React.CSSProperties;
}

interface Ball {
  x:  number;
  y:  number;
  vx: number;
  vy: number;
  r:  number;
  hue: number;
  sat: number;
  lit: number;
}

export default function Ballpit({
  count        = 200,
  gravity      = 0,
  friction     = 0.998,
  wallBounce   = 1,
  followCursor = false,
  ambientIntensity = 0.82,
  lightIntensity   = 10,
  className    = "",
  style,
}: BallpitProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const frameRef   = useRef<number>(0);
  const ballsRef   = useRef<Ball[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Spawn balls
    const hues = [260, 280, 220, 300, 200, 240];
    ballsRef.current = Array.from({ length: count }, (_, i) => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * 2.5,
      vy:  (Math.random() - 0.5) * 2.5,
      r:   Math.random() * 10 + 4,
      hue: hues[i % hues.length],
      sat: 60 + Math.random() * 30,
      lit: 50 + Math.random() * 20,
    }));

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -9999, y: -9999 };
    });

    // Animate
    const tick = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const b of ballsRef.current) {
        // Cursor attraction
        if (followCursor) {
          const dx = mouseRef.current.x - b.x;
          const dy = mouseRef.current.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0.1) {
            b.vx += (dx / dist) * 0.18;
            b.vy += (dy / dist) * 0.18;
          }
        }

        // Gravity
        b.vy += gravity * 0.15;

        // Friction
        b.vx *= friction;
        b.vy *= friction;

        // Cap speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > 6) {
          b.vx = (b.vx / speed) * 6;
          b.vy = (b.vy / speed) * 6;
        }

        // Move
        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce
        if (b.x - b.r < 0)  { b.x = b.r;      b.vx = Math.abs(b.vx) * wallBounce; }
        if (b.x + b.r > W)  { b.x = W - b.r;   b.vx = -Math.abs(b.vx) * wallBounce; }
        if (b.y - b.r < 0)  { b.y = b.r;       b.vy = Math.abs(b.vy) * wallBounce; }
        if (b.y + b.r > H)  { b.y = H - b.r;   b.vy = -Math.abs(b.vy) * wallBounce; }

        // Draw
        const alpha = Math.min(1, ambientIntensity);
        const color = `hsla(${b.hue}, ${b.sat}%, ${b.lit}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = color;

        // Glow
        ctx.shadowColor  = `hsl(${b.hue}, 80%, 65%)`;
        ctx.shadowBlur   = lightIntensity;
        ctx.fill();
        ctx.shadowBlur   = 0;
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
    };
  }, [count, gravity, friction, wallBounce, followCursor, ambientIntensity, lightIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width:  "100%",
        height: "100%",
        display:"block",
        ...style,
      }}
    />
  );
}
