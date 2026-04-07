"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button }        from "@/components/ui/Button";
import { Hero }          from "@/components/landing/Hero";
import { StatsBar }      from "@/components/landing/StatsBar";
import { ScrollStack, ScrollStackItem } from "@/components/landing/ScrollStack";
import { ModelsGrid }    from "@/components/landing/ModelsGrid";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { FinalCTA }      from "@/components/landing/FinalCTA";
import { useLenis }      from "@/hooks/useLenis";

// ============================================================
// NAV — Task 2: prefetch arena route; Task 3: no Compare/History/Settings nav links here
// ============================================================

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Task 2 — prefetch /arena immediately on mount for instant navigation
  useEffect(() => {
    router.prefetch("/arena");
  }, [router]);

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

      {/* Right — Task 3: Only GitHub + Open Arena. No Arena/Compare, History, Settings links */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open("https://github.com/Rahulpande7795", "_blank")}
        >
          GitHub
        </Button>

        {/* Task 2 — Link with prefetch={true} for instant navigation */}
        <Link href="/arena" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm">
            Open Arena →
          </Button>
        </Link>
      </div>
    </nav>
  );
}

// ============================================================
// SCROLL STACK CONTENT — Task 8
// ============================================================

function FeaturesScrollStack() {
  return (
    <section
      style={{
        paddingTop:      80,
        paddingBottom:   40,
        backgroundColor: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontWeight:    800,
              fontSize:      "clamp(28px, 4vw, 42px)",
              color:         "var(--ink)",
              marginBottom:  12,
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-3)", maxWidth: 480, margin: "0 auto" }}>
            LLM Arena is built for developers, researchers, and AI enthusiasts who demand clarity.
          </p>
        </div>

        <ScrollStack>
          <ScrollStackItem index={0}>
            <h3
              style={{
                fontWeight:   800,
                fontSize:     "clamp(22px, 3vw, 32px)",
                color:        "var(--ink)",
                margin:       "0 0 10px",
                letterSpacing:"-0.015em",
              }}
            >
              Compare Any Models
            </h3>
            <p style={{ fontSize: 16, color: "var(--ink-3)", margin: 0, lineHeight: 1.7 }}>
              Fire the same prompt at up to 11 LLMs simultaneously — GPT, Claude, Mistral, Llama,
              Qwen and more — and watch their responses stream side by side in real time.
            </p>
          </ScrollStackItem>

          <ScrollStackItem index={1}>
            <h3
              style={{
                fontWeight:   800,
                fontSize:     "clamp(22px, 3vw, 32px)",
                color:        "var(--ink)",
                margin:       "0 0 10px",
                letterSpacing:"-0.015em",
              }}
            >
              Real-Time Metrics
            </h3>
            <p style={{ fontSize: 16, color: "var(--ink-3)", margin: 0, lineHeight: 1.7 }}>
              Every response card shows live TTFT, tokens per second, and total latency.
              See the leaderboard form as models race to finish — find the fastest model for your workload.
            </p>
          </ScrollStackItem>

          <ScrollStackItem index={2}>
            <h3
              style={{
                fontWeight:   800,
                fontSize:     "clamp(22px, 3vw, 32px)",
                color:        "var(--ink)",
                margin:       "0 0 10px",
                letterSpacing:"-0.015em",
              }}
            >
              Tool Mode
            </h3>
            <p style={{ fontSize: 16, color: "var(--ink-3)", margin: 0, lineHeight: 1.7 }}>
              Enable function calling and watch models use real tools — weather lookup, commodity prices,
              exchange rates — to answer your questions. Instantly see which models actually
              call tools vs. fabricate an answer.
            </p>
          </ScrollStackItem>

          <ScrollStackItem index={3}>
            <h3
              style={{
                fontWeight:   800,
                fontSize:     "clamp(22px, 3vw, 32px)",
                color:        "var(--ink)",
                margin:       "0 0 10px",
                letterSpacing:"-0.015em",
              }}
            >
              Full History & Export
            </h3>
            <p style={{ fontSize: 16, color: "var(--ink-3)", margin: 0, lineHeight: 1.7 }}>
              Every run is automatically saved. Export any comparison as JSON, CSV, Markdown, or
              plain text. Replay past sessions, search across history, and share results with your team.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </section>
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

        {/* Task 8 — ScrollStack features section (below hero, above models) */}
        <FeaturesScrollStack />

        {/* Tasks 6 + 7 — ModelsGrid with TiltedCard inside MagicBento */}
        <ModelsGrid />

        <FeaturesBento />
        <FinalCTA />
      </div>
    </div>
  );
}