"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================
// TYPES
// ============================================================

interface LayoutResult {
  columns:             number;
  gridTemplateColumns: string;
}

// ============================================================
// COLUMN MAP
// ============================================================

function getIdealColumns(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count === 4) return 2; // 2×2 grid
  if (count <= 6) return 3;
  return 4;                  // 7+
}

// ============================================================
// HOOK
// ============================================================

export function useLayout(modelCount: number): LayoutResult {
  const MIN_CARD_WIDTH = 280; // px — collapse a column if narrower

  const [columns, setColumns] = useState(() => getIdealColumns(modelCount));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function calculate() {
      const ideal    = getIdealColumns(modelCount);
      const viewportW = window.innerWidth;
      // Rough sidebar width (268px expanded or 64px collapsed)
      const sidebarW  = viewportW > 640 ? 268 : 0;
      const available = viewportW - sidebarW - 32; // 16px padding each side

      let cols = ideal;
      while (cols > 1 && available / cols < MIN_CARD_WIDTH) {
        cols--;
      }
      setColumns(cols);
    }

    calculate();

    function onResize() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(calculate, 100);
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [modelCount]);

  // Recalculate whenever model count changes
  useEffect(() => {
    const ideal = getIdealColumns(modelCount);
    setColumns(ideal);
  }, [modelCount]);

  return {
    columns,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };
}