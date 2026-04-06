"use client";

import { useEffect, useRef } from "react";

// Lenis type — imported dynamically so we can type it safely
type LenisInstance = {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: number | string | HTMLElement, opts?: object) => void;
};

/**
 * Initialises Lenis smooth scrolling synced with GSAP's ticker.
 * Both libraries are loaded dynamically (no SSR, no bundle impact).
 * Returns the Lenis instance ref (null until initialized).
 */
export function useLenis() {
  const lenisRef = useRef<LenisInstance | null>(null);
  // Store GSAP ticker fn so we can remove it on cleanup
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Only runs in the browser
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function init() {
      try {
        const [{ default: Lenis }, gsapModule] = await Promise.all([
          import("@studio-freight/lenis"),
          import("gsap"),
        ]);

        if (cancelled) return;

        const gsap = gsapModule.default ?? gsapModule;

        const lenis = new Lenis({
          lerp:     0.10,
          duration: 1.2,
        }) as LenisInstance;

        lenisRef.current = lenis;

        // Sync Lenis with GSAP ticker
        const tickerFn = (time: number) => lenis.raf(time * 1000);
        tickerFnRef.current = tickerFn;

        (gsap as { ticker: { add: (fn: (t: number) => void) => void; lagSmoothing: (v: number) => void } })
          .ticker.add(tickerFn);
        (gsap as { ticker: { add: (fn: (t: number) => void) => void; lagSmoothing: (v: number) => void } })
          .ticker.lagSmoothing(0);

      } catch {
        // GSAP / Lenis failed to load — degrade gracefully
        console.warn("[useLenis] Could not initialise smooth scroll.");
      }
    }

    init();

    return () => {
      cancelled = true;

      // Clean up GSAP ticker
      if (tickerFnRef.current) {
        import("gsap")
          .then((mod) => {
            const gsap = mod.default ?? mod;
            (gsap as { ticker: { remove: (fn: (t: number) => void) => void } })
              .ticker.remove(tickerFnRef.current!);
          })
          .catch(() => {});
        tickerFnRef.current = null;
      }

      // Destroy Lenis
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}