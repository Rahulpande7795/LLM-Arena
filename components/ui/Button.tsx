"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

// ============================================================
// TYPES
// ============================================================

export type ButtonVariant = "primary" | "ghost" | "danger";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  disabled?:  boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?:   (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?:  React.ReactNode;
  className?: string;
  type?:      "button" | "submit" | "reset";
  title?:     string;
  "aria-label"?: string;
}

// ============================================================
// STYLE MAPS
// ============================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white font-semibold border border-transparent " +
    "hover:brightness-110",
  ghost:
    "bg-transparent border border-[var(--border-s)] text-[var(--ink-2)] " +
    "hover:bg-[var(--bg-3)] hover:text-[var(--ink)]",
  danger:
    "border text-[var(--red)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5",
  md: "px-4 py-2   text-[14px] gap-2",
  lg: "px-5 py-2.5 text-[16px] gap-2",
};

// ============================================================
// SPINNER
// ============================================================

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="7" cy="7" r="5.5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "ghost",
      size    = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      onClick,
      children,
      className,
      type = "button",
      title,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Danger variant needs inline CSS vars for color-mix
    const dangerStyle =
      variant === "danger"
        ? {
            backgroundColor: "color-mix(in srgb, var(--red) 12%, transparent)",
            borderColor:     "color-mix(in srgb, var(--red) 30%, transparent)",
          }
        : {};

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        title={title}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        style={dangerStyle}
        whileHover={
          isDisabled
            ? {}
            : { y: -1, boxShadow: "var(--shadow-md)" }
        }
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          // base
          "inline-flex items-center justify-center rounded-[var(--r-md)]",
          "font-medium leading-none select-none cursor-pointer",
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
          // variant
          variantStyles[variant],
          // size
          sizeStyles[size],
          // disabled
          isDisabled && "opacity-45 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        {/* Left icon or spinner */}
        {loading ? (
          <Spinner />
        ) : leftIcon ? (
          <span aria-hidden="true">{leftIcon}</span>
        ) : null}

        {children}

        {/* Right icon */}
        {rightIcon && !loading && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";