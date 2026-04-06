"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface SkeletonLineProps {
  width?:     string | number;
  height?:    number;
  className?: string;
}

export function SkeletonLine({
  width   = "100%",
  height  = 14,
  className,
}: SkeletonLineProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width:           typeof width === "number" ? `${width}px` : width,
        height:          height,
        borderRadius:    "var(--r-xs)",
        backgroundColor: "var(--bg-2)",
        flexShrink:      0,
      }}
      aria-hidden="true"
    >
      {/* Shimmer overlay */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          background:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation:  "shimmer 1.6s ease infinite",
        }}
      />
    </div>
  );
}