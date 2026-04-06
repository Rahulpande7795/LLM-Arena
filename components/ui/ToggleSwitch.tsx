"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

// ============================================================
// TYPES
// ============================================================

interface ToggleSwitchProps {
  checked:    boolean;
  onChange:   (checked: boolean) => void;
  label?:     string;
  size?:      "sm" | "md";
  className?: string;
  disabled?:  boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function ToggleSwitch({
  checked,
  onChange,
  label,
  size      = "md",
  className,
  disabled  = false,
}: ToggleSwitchProps) {
  const id = useId();

  // Size variants
  const track = size === "md"
    ? { width: 40, height: 22, thumbSize: 16, thumbOffset: 2 }
    : { width: 32, height: 18, thumbSize: 12, thumbOffset: 2 };

  const thumbTravel =
    track.width - track.thumbSize - track.thumbOffset * 2;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none",
        disabled && "opacity-45 cursor-not-allowed",
        className
      )}
    >
      {/* Track */}
      <motion.div
        role="switch"
        aria-checked={checked}
        id={id}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === " " || e.key === "Enter")) {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        onClick={() => !disabled && onChange(!checked)}
        animate={{
          backgroundColor: checked ? "var(--accent)" : "var(--bg-3)",
        }}
        transition={{ duration: 0.18 }}
        style={{
          width:        track.width,
          height:       track.height,
          borderRadius: track.height,
          position:     "relative",
          flexShrink:   0,
          cursor:       disabled ? "not-allowed" : "pointer",
        }}
        className="focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
      >
        {/* Thumb */}
        <motion.div
          animate={{ x: checked ? thumbTravel : 0 }}
          transition={{
            type:      "spring",
            stiffness: 600,
            damping:   20,
          }}
          style={{
            position:     "absolute",
            top:          track.thumbOffset,
            left:         track.thumbOffset,
            width:        track.thumbSize,
            height:       track.thumbSize,
            borderRadius: "50%",
            backgroundColor: "white",
            boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </motion.div>

      {/* Label */}
      {label && (
        <span
          style={{
            fontSize:   14,
            color:      "var(--ink-2)",
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}