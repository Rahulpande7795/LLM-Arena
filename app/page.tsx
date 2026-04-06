"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Hero }          from "@/components/landing/Hero";
import { StatsBar }      from "@/components/landing/StatsBar";
import { HowItWorks }    from "@/components/landing/HowItWorks";
import { ModelsGrid }    from "@/components/landing/ModelsGrid";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { FinalCTA }      from "@/components/landing/FinalCTA";
import { useLenis }      from "@/hooks/useLenis";

// ============================================================
// NAV
// ============================================================

function Nav() {
  const router  = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 60); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        zIndex:          40,
        height:          60,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 24px",
        backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter:  "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom:    "1px solid var(--border)",
        boxShadow:       scrolled ? "var(--shadow-sm)" : "none",
        transition:      "box-shadow 200ms ease-out",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        8,
          fontWeight: 800,
          fontSize:   17,
          color:      "var(--ink)",
          cursor:     "pointer",
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span style={{ color: "var(--accent-hi)" }}>⚡</span>
        LLM Arena
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open("https://github.com/Rahulpande7795", "_blank")}
        >
          GitHub
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/arena")}
        >
          Open Arena →
        </Button>
      </div>
    </nav>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function LandingPage() {
  useLenis();

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        color:           "var(--ink)",
        overflowX:       "hidden",
      }}
    >
      <Nav />

      {/* pt-[60px] to compensate for fixed nav */}
      <div style={{ paddingTop: 60 }}>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <ModelsGrid />
        <FeaturesBento />
        <FinalCTA />
      </div>
    </div>
  );
}