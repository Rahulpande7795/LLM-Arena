"use client";

import React, { useRef, useState } from "react";

// ============================================================
// InteractiveHoverButton
// A premium button with animated fill-from-cursor hover effect.
// ============================================================

interface InteractiveHoverButtonProps {
  children:   React.ReactNode;
  onClick?:   (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?:  boolean;
  type?:      "button" | "submit" | "reset";
  "aria-label"?: string;
  title?:     string;
  style?:     React.CSSProperties;
}

export function InteractiveHoverButton({
  children,
  onClick,
  className = "",
  disabled  = false,
  type      = "button",
  "aria-label": ariaLabel,
  title,
  style,
}: InteractiveHoverButtonProps) {
  const btnRef  = useRef<HTMLButtonElement>(null);
  const [pos,   setPos]   = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      title={title}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        position:        "relative",
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             8,
        padding:         "10px 22px",
        borderRadius:    "var(--r-md)",
        border:          "1.5px solid var(--accent)",
        backgroundColor: disabled ? "var(--bg-3)" : "var(--accent)",
        color:           disabled ? "var(--ink-4)" : "#ffffff",
        fontSize:        14,
        fontWeight:      600,
        fontFamily:      "var(--font-plus-jakarta-sans), sans-serif",
        cursor:          disabled ? "not-allowed" : "pointer",
        overflow:        "hidden",
        outline:         "none",
        transition:      "border-color 200ms ease-out, color 120ms ease-out",
        userSelect:      "none",
        whiteSpace:      "nowrap",
        opacity:         disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {/* Radial fill blob */}
      <span
        aria-hidden="true"
        style={{
          position:        "absolute",
          top:             pos.y,
          left:            pos.x,
          transform:       "translate(-50%, -50%)",
          width:           hover ? "400px" : "0px",
          height:          hover ? "400px" : "0px",
          borderRadius:    "50%",
          backgroundColor: "rgba(255,255,255,0.13)",
          transition:      "width 500ms ease-out, height 500ms ease-out, opacity 500ms ease-out",
          opacity:         hover ? 1 : 0,
          pointerEvents:   "none",
        }}
      />
      {/* Label — stays above the blob */}
      <span style={{ position: "relative", zIndex: 1 }}>
        {children}
      </span>
    </button>
  );
}
