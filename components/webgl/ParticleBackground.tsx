"use client";

import React, { useEffect, useRef } from "react";

// ============================================================
// TYPES
// ============================================================

interface ParticleBackgroundProps {
  enabled?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const COUNT = 1800;

// Model identity colours — assigned round-robin to particles
const PALETTE: [number, number, number][] = [
  [139 / 255, 92 / 255,  246 / 255], // violet  #8b5cf6
  [6   / 255, 182 / 255, 212 / 255], // cyan    #06b6d4
  [245 / 255, 158 / 255, 11  / 255], // amber   #f59e0b
  [74  / 255, 222 / 255, 128 / 255], // green   #4ade80
  [249 / 255, 115 / 255, 22  / 255], // orange  #f97316
];

// ============================================================
// COMPONENT
// ============================================================

export default function ParticleBackground({
  enabled = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // Capture ref synchronously — safe to use in cleanup closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frameId: number;
    let frame = 0;
    let mouseX = 0;
    let mouseY = 0;
    let cancelled = false;

    // ── Dynamic Three.js import (never SSR) ──────────────────
    import("three").then((THREE) => {
      if (cancelled) return;

      // ── Scene ──────────────────────────────────────────────
      const scene    = new THREE.Scene();
      scene.background = null;

      const camera   = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({
        alpha:     true,
        antialias: false,
        canvas,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // ── Particle geometry ──────────────────────────────────
      const positions = new Float32Array(COUNT * 3);
      const colors    = new Float32Array(COUNT * 3);

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

        const c = PALETTE[i % PALETTE.length];
        colors[i * 3]     = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );

      const material = new THREE.PointsMaterial({
        size:         0.025,
        vertexColors: true,
      });

      const mesh = new THREE.Points(geometry, material);
      scene.add(mesh);

      // ── Theme-aware opacity ────────────────────────────────
      function updateOpacity() {
        if (!canvas) return;
        const theme = document.documentElement.getAttribute("data-theme");
        canvas.style.opacity = theme === "light" ? "0.07" : "0.38";
      }
      updateOpacity();

      const observer = new MutationObserver(updateOpacity);
      observer.observe(document.documentElement, {
        attributes:      true,
        attributeFilter: ["data-theme"],
      });

      // ── Mouse parallax ─────────────────────────────────────
      function onMouseMove(e: MouseEvent) {
        mouseX = e.clientX / window.innerWidth  - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
      }
      window.addEventListener("mousemove", onMouseMove, { passive: true });

      // ── Resize ─────────────────────────────────────────────
      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onResize, { passive: true });

      // ── Animation loop ─────────────────────────────────────
      function animate() {
        frameId = requestAnimationFrame(animate);
        frame++;

        // Render every other frame for performance
        if (frame % 2 !== 0) return;

        // Slow rotation
        mesh.rotation.y += 0.00018;
        mesh.rotation.x += 0.00008;

        // Mouse parallax — smooth lerp
        camera.position.x +=
          (mouseX * 0.3 - camera.position.x) * 0.025;
        camera.position.y +=
          (-mouseY * 0.2 - camera.position.y) * 0.025;

        renderer.render(scene, camera);
      }
      animate();

      // ── Cleanup ────────────────────────────────────────────
      // Store cleanup fn in the outer scope so the outer
      // useEffect return can call it
      ;(canvasRef as React.MutableRefObject<HTMLCanvasElement & {
        __cleanup?: () => void
      }>).current.__cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize",    onResize);
        observer.disconnect();
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      // Use the locally captured canvas, not canvasRef.current (which may be null by cleanup time)
      const el = canvas as HTMLCanvasElement & { __cleanup?: () => void };
      el?.__cleanup?.();
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
        opacity:       0.38, // overridden by JS after mount
        display:       "block",
      }}
    />
  );
}