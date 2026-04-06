"use client";

import React from "react";

export function EmptyState() {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        flex:           1,
        padding:        "64px 32px",
        textAlign:      "center",
        userSelect:     "none",
      }}
    >
      {/* CSS-only geometric illustration */}
      <div
        aria-hidden="true"
        style={{ position: "relative", width: 120, height: 120, marginBottom: 32 }}
      >
        {/* Outer ring */}
        <div
          style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "50%",
            border:       "1.5px solid var(--border-s)",
          }}
        />
        {/* Middle ring */}
        <div
          style={{
            position:     "absolute",
            inset:        20,
            borderRadius: "50%",
            border:       "1.5px dashed var(--border-s)",
          }}
        />
        {/* Inner filled circle */}
        <div
          style={{
            position:        "absolute",
            inset:           42,
            borderRadius:    "50%",
            backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
            border:          "1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}
        >
          {/* Lightning bolt */}
          <span
            style={{
              fontSize: 16,
              lineHeight: 1,
              color: "var(--accent-hi)",
            }}
          >
            ⚡
          </span>
        </div>
        {/* 3 small dots around the outer ring */}
        {[0, 120, 240].map((deg) => (
          <div
            key={deg}
            style={{
              position:        "absolute",
              top:             "50%",
              left:            "50%",
              width:           6,
              height:          6,
              borderRadius:    "50%",
              backgroundColor: "var(--bg-3)",
              transform: `rotate(${deg}deg) translateY(-54px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      {/* Main text */}
      <p
        style={{
          fontSize:   17,
          color:      "var(--ink-3)",
          margin:     0,
          lineHeight: 1.6,
          maxWidth:   340,
        }}
      >
        Select models above and enter a prompt to begin
      </p>

      {/* Sub text */}
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize:   13,
          color:      "var(--ink-4)",
          marginTop:  10,
          marginBottom: 0,
        }}
      >
        Press{" "}
        <kbd
          style={{
            backgroundColor: "var(--bg-2)",
            border:          "1px solid var(--border-s)",
            borderRadius:    "var(--r-xs)",
            padding:         "1px 5px",
            fontSize:        12,
          }}
        >
          Ctrl+K
        </kbd>{" "}
        for prompt templates
      </p>
    </div>
  );
}