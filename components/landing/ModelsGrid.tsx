"use client";

import React, { useEffect, useRef } from "react";
import { MODELS } from "@/lib/models";

export function ModelsGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setup() {
      try {
        const gsapMod = await import("gsap");
        const stMod   = await import("gsap/ScrollTrigger");
        const gsap    = gsapMod.default ?? gsapMod;
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);

        if (!gridRef.current) return;
        const cards = gridRef.current.querySelectorAll(".model-card");

        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.94 },
          {
            opacity:  1,
            scale:    1,
            duration: 0.4,
            ease:     "power2.out",
            stagger:  0.06,
            scrollTrigger: {
              trigger: gridRef.current,
              start:   "top 85%",
            },
          }
        );
      } catch {
        if (gridRef.current) {
          gridRef.current.querySelectorAll<HTMLElement>(".model-card")
            .forEach((el) => { el.style.opacity = "1"; });
        }
      }
    }
    setup();
  }, []);

  return (
    <section
      style={{
        padding:         "96px 24px",
        backgroundColor: "var(--bg-1)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            fontWeight:   800,
            fontSize:     "clamp(28px, 4vw, 40px)",
            textAlign:    "center",
            color:        "var(--ink)",
            marginBottom: 48,
            letterSpacing: "-0.02em",
          }}
        >
          Supported Models
        </h2>

        <div
          ref={gridRef}
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap:                 14,
          }}
        >
          {MODELS.map((model) => (
            <div
              key={model.id}
              className="model-card"
              style={{
                opacity:         0,
                backgroundColor: "var(--bg)",
                borderRadius:    "var(--r-lg)",
                padding:         "14px 16px",
                boxShadow:       "var(--shadow-sm)",
                borderLeft:      `3px solid ${model.color}`,
                transition:      "transform 150ms ease-out, box-shadow 150ms ease-out",
                cursor:          "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform  = "translateY(-3px)";
                el.style.boxShadow  = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform  = "translateY(0)";
                el.style.boxShadow  = "var(--shadow-sm)";
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width:           10,
                      height:          10,
                      borderRadius:    "50%",
                      backgroundColor: model.color,
                      boxShadow:       `0 0 6px ${model.color}66`,
                      flexShrink:      0,
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                    {model.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily:    "var(--font-jetbrains-mono), monospace",
                    fontSize:      11,
                    color:         "var(--ink-4)",
                    backgroundColor: "var(--bg-2)",
                    padding:       "2px 6px",
                    borderRadius:  "var(--r-xs)",
                    flexShrink:    0,
                  }}
                >
                  {model.sizeLabel}
                </span>
              </div>

              {/* Full name */}
              <p
                style={{
                  fontFamily:   "var(--font-jetbrains-mono), monospace",
                  fontSize:     10,
                  color:        "var(--ink-4)",
                  margin:       0,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}
                title={model.fullName}
              >
                {model.fullName}
              </p>

              {/* Default badge */}
              {model.active && (
                <span
                  style={{
                    display:         "inline-block",
                    marginTop:       8,
                    fontSize:        10,
                    fontFamily:      "var(--font-jetbrains-mono), monospace",
                    color:           "var(--green)",
                    backgroundColor: "color-mix(in srgb, var(--green) 12%, transparent)",
                    padding:         "1px 6px",
                    borderRadius:    "var(--r-full)",
                  }}
                >
                  default on
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}