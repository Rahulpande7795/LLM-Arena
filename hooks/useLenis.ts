"use client";

import { useEffect, useRef } from "react";

// Lenis type — imported dynamically so we can type it safely
type LenisInstance = {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: number | string | HTMLElement, opts?: object) => void;
};

/**
 * Initialises Lenis smooth scrolling using native requestAnimationFrame.
 * Both libraries are loaded dynamically (no SSR, no bundle impact).
 * Returns the Lenis instance ref (null until initialized).
 */
export function useLenis() {
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only runs in the browser
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function init() {
      try {
        const { default: Lenis } = await import("@studio-freight/lenis");

        if (cancelled) return;

        const lenis = new Lenis({
          lerp:     0.10,
          duration: 1.2,
        }) as LenisInstance;

        lenisRef.current = lenis;

        // Native requestAnimationFrame loop
        const raf = (time: number) => {
          lenis.raf(time);
          rafIdRef.current = requestAnimationFrame(raf);
        };

        rafIdRef.current = requestAnimationFrame(raf);

      } catch {
        // Lenis failed to load — degrade gracefully
        console.warn("[useLenis] Could not initialise smooth scroll.");
      }
    }

    init();

    return () => {
      cancelled = true;

      // Clean up requestAnimationFrame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Destroy Lenis
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}