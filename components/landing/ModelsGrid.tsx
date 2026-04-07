"use client";

import React from "react";
import { MODELS } from "@/lib/models";
import TiltedCard from "@/components/ui/TiltedCard";
import MagicBento from "@/components/ui/MagicBento";

export function ModelsGrid() {
  return (
    <section
      style={{
        padding:         "96px 24px",
        backgroundColor: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontWeight:    800,
              fontSize:      "clamp(28px, 4vw, 42px)",
              color:         "var(--ink)",
              marginBottom:  12,
              letterSpacing: "-0.02em",
            }}
          >
            Supported Models
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-3)", maxWidth: 520, margin: "0 auto" }}>
            Compare any of these 11 state-of-the-art LLMs side by side with a single prompt.
          </p>
        </div>

        {/* MagicBento container */}
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={500}
          particleCount={16}
          glowColor="139, 92, 246"
          disableAnimations={false}
        >
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap:                 20,
            }}
          >
            {MODELS.map((model) => (
              <div key={model.id} style={{ display: "flex", justifyContent: "center" }}>
                <TiltedCard
                  imageSrc={model.logoSvg}
                  isUrl={false}
                  altText={model.label}
                  captionText={model.label}
                  containerHeight={220}
                  containerWidth={180}
                  imageHeight={80}
                  imageWidth={80}
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  accentColor={model.color}
                  overlayContent={
                    <div style={{ textAlign: "center", padding: "0 8px" }}>
                      <p
                        style={{
                          fontSize:   12,
                          fontWeight: 700,
                          color:      "var(--bg)",
                          margin:     0,
                          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        {model.label}
                      </p>
                      <p
                        style={{
                          fontSize:   10,
                          color:      "rgba(255,255,255,0.8)",
                          margin:     "2px 0 0",
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                        }}
                      >
                        {model.sizeLabel}
                      </p>
                    </div>
                  }
                />
              </div>
            ))}
          </div>

          {/* Default models legend */}
          <div
            style={{
              marginTop:   24,
              display:     "flex",
              flexWrap:    "wrap",
              gap:         8,
              justifyContent: "center",
            }}
          >
            {MODELS.filter((m) => m.active).map((m) => (
              <span
                key={m.id}
                style={{
                  display:         "inline-flex",
                  alignItems:      "center",
                  gap:             5,
                  fontSize:        12,
                  color:           "var(--ink-3)",
                  backgroundColor: "var(--bg-2)",
                  padding:         "3px 10px",
                  borderRadius:    "var(--r-full)",
                  border:          "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width:           7,
                    height:          7,
                    borderRadius:    "50%",
                    backgroundColor: m.color,
                    display:         "inline-block",
                    flexShrink:      0,
                  }}
                />
                {m.label}
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 10 }}>
                  ✓ default
                </span>
              </span>
            ))}
          </div>
        </MagicBento>
      </div>
    </section>
  );
}