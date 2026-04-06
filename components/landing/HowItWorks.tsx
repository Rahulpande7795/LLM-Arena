"use client";

import React, { useEffect, useRef } from "react";

const STEPS = [
  {
    number: "01",
    icon:   "⚙️",
    title:  "Configure",
    desc:   "Select your models and set your API endpoint once. Your key never leaves your machine.",
  },
  {
    number: "02",
    icon:   "✏️",
    title:  "Prompt",
    desc:   "Write a custom prompt or choose from 13 built-in templates spanning code, reasoning, and language.",
  },
  {
    number: "03",
    icon:   "⚡",
    title:  "Race",
    desc:   "All selected models respond simultaneously in real time via streaming. Watch the tokens appear.",
  },
  {
    number: "04",
    icon:   "📊",
    title:  "Analyze",
    desc:   "Compare TTFT, TPS, and quality side by side. Export results in JSON, CSV, Markdown, or Text.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setup() {
      try {
        const gsapMod = await import("gsap");
        const stMod   = await import("gsap/ScrollTrigger");
        const gsap    = gsapMod.default ?? gsapMod;
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);

        if (!sectionRef.current) return;
        const cards = sectionRef.current.querySelectorAll(".how-card");

        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity:  1,
            y:        0,
            duration: 0.6,
            ease:     "power2.out",
            stagger:  0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start:   "top 80%",
            },
          }
        );
      } catch {
        // GSAP not available — show without animation
        if (sectionRef.current) {
          sectionRef.current.querySelectorAll<HTMLElement>(".how-card")
            .forEach((el) => { el.style.opacity = "1"; });
        }
      }
    }
    setup();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding:   "96px 24px",
        maxWidth:  1100,
        margin:    "0 auto",
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontWeight:   800,
          fontSize:     "clamp(28px, 4vw, 40px)",
          textAlign:    "center",
          color:        "var(--ink)",
          marginBottom: 56,
          letterSpacing: "-0.02em",
        }}
      >
        How LLM Arena Works
      </h2>

      {/* Steps grid */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap:                 24,
          position:            "relative",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className="how-card"
            style={{
              opacity:         0,
              backgroundColor: "var(--bg-1)",
              borderRadius:    "var(--r-xl)",
              padding:         "24px 20px",
              boxShadow:       "var(--shadow-sm)",
              position:        "relative",
            }}
          >
            {/* Number chip */}
            <div
              style={{
                display:         "inline-flex",
                alignItems:      "center",
                justifyContent:  "center",
                width:           34,
                height:          34,
                borderRadius:    "var(--r-sm)",
                backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
                color:           "var(--accent-hi)",
                fontWeight:      700,
                fontSize:        13,
                fontFamily:      "var(--font-jetbrains-mono), monospace",
                marginBottom:    14,
              }}
            >
              {step.number}
            </div>

            {/* Icon */}
            <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>
              {step.icon}
            </div>

            {/* Title */}
            <h3
              style={{
                fontWeight:   700,
                fontSize:     17,
                color:        "var(--ink)",
                margin:       "0 0 8px",
              }}
            >
              {step.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize:   15,
                color:      "var(--ink-3)",
                lineHeight: 1.65,
                margin:     0,
              }}
            >
              {step.desc}
            </p>

            {/* Arrow connector (desktop only, not last) */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  position:  "absolute",
                  top:       "50%",
                  right:     -16,
                  transform: "translateY(-50%)",
                  color:     "var(--ink-4)",
                  fontSize:  20,
                  zIndex:    1,
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}