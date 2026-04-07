"use client";

import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { motion, useAnimate, stagger } from "framer-motion";
import { useRouter } from "next/navigation";
import { MODELS } from "@/lib/models";
import { InteractiveHoverButton } from "@/registry/magicui/interactive-hover-button";
import BorderGlow from "@/registry/magicui/BorderGlow";

// Lazy-import heavy canvas components so they don't block SSR
// const Ballpit = lazy(() => import("@/registry/magicui/Ballpit"));
const Orb = lazy(() => import("@/registry/magicui/Orb"));

// ============================================================
// MINI DEMO CARDS
// ============================================================

const DEMO_CONTENT = [
  {
    modelId: "mistral-24b",
    text: "The capital of Australia is Canberra. It was selected as the capital in 1908 as a compromise between rivals Sydney and Melbourne...",
  },
  {
    modelId: "llama-8b",
    text: "Australia's capital city is Canberra, located in the Australian Capital Territory. It became the capital in 1913 when...",
  },
  {
    modelId: "qwen-24b",
    text: "Canberra is the capital of Australia. It was purpose-built to serve as the nation's capital and is situated between Sydney and Melbourne...",
  },
];

function MiniCard({
  modelId,
  text,
  winner,
  active,
}: {
  modelId: string;
  text: string;
  winner: boolean;
  active: boolean;
}) {
  const model = MODELS.find((m) => m.id === modelId);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    let i = 0;
    const delay =
      modelId === "mistral-24b" ? 0 : modelId === "llama-8b" ? 200 : 400;
    const speed =
      modelId === "mistral-24b" ? 28 : modelId === "llama-8b" ? 35 : 42;

    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(start);
  }, [active, text, modelId]);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-1)",
        borderRadius: "var(--r-lg)",
        border: `1.5px solid ${model?.color ?? "var(--border)"}33`,
        borderLeft: `3px solid ${model?.color ?? "var(--border)"}`,
        padding: "12px 14px",
        position: "relative",
        boxShadow: winner
          ? "var(--shadow-glow), var(--shadow-md)"
          : "var(--shadow-sm)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: model?.color,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
          {model?.label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            color: "var(--ink-4)",
            backgroundColor: "var(--bg-2)",
            padding: "1px 5px",
            borderRadius: "var(--r-xs)",
          }}
        >
          {model?.sizeLabel}
        </span>
      </div>

      {/* Text */}
      <p
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          lineHeight: 1.6,
          margin: 0,
          minHeight: 58,
        }}
      >
        {displayed}
        {active && displayed.length < text.length && (
          <span
            style={{
              display: "inline-block",
              width: 1.5,
              height: "1em",
              backgroundColor: "var(--accent)",
              marginLeft: 1,
              verticalAlign: "text-bottom",
              animation: "blink-cursor 0.7s step-end infinite",
            }}
          />
        )}
      </p>

      {/* Winner badge */}
      {winner && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 20,
            delay: 2.8,
          }}
          style={{
            position: "absolute",
            top: -10,
            right: 10,
            backgroundColor:
              "color-mix(in srgb, var(--amber) 15%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--amber) 40%, transparent)",
            borderRadius: "var(--r-full)",
            padding: "3px 8px",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--amber)",
            whiteSpace: "nowrap",
          }}
        >
          🏆 Fastest
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// HERO
// ============================================================

export function Hero() {
  const router = useRouter();
  const [demoActive, setDemoActive] = useState(false);
  const [scope, animate] = useAnimate();
  const promptRef = useRef<HTMLInputElement>(null);
  const [promptVal, setPromptVal] = useState("");

  useEffect(() => {
    async function sequence() {
      await animate(
        "#eyebrow",
        { opacity: [0, 1], y: [12, 0] },
        { duration: 0.3, ease: "easeOut", delay: 0.1 },
      );
      await animate(
        ".hero-word",
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.5, ease: "easeOut", delay: stagger(0.08) },
      );
      await animate(
        "#subtitle",
        { opacity: [0, 1] },
        { duration: 0.3, ease: "easeOut" },
      );
      await animate(
        "#ctas",
        { opacity: [0, 1], scale: [0.92, 1] },
        { duration: 0.3, ease: "easeOut" },
      );
      await animate(
        "#demo-bar",
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.3, ease: "easeOut" },
      );
      await animate(
        "#demo-cards",
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.3, ease: "easeOut" },
      );
      setDemoActive(true);
    }
    sequence();
  }, [animate]);

  return (
    <section
      ref={scope}
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 60px",
        textAlign: "center",
        position: "relative", // required for Ballpit z-index
        overflow: "hidden",
      }}
    >
      {/* ── Task 1: Ballpit background ── */}
      {/* <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <Ballpit
            count={300}
            gravity={0.01}
            friction={0.998}
            wallBounce={1}
            ambientIntensity={0.8}
            lightIntensity={80}
            followCursor={false}
          />
        </Suspense>
      </div> */}

      {/* ── All content sits above Ballpit ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Eyebrow pill */}
        <div
          id="eyebrow"
          style={{
            opacity: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: "var(--r-full)",
            backgroundColor:
              "color-mix(in srgb, var(--accent) 12%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            fontSize: 14,
            color: "var(--accent-hi)",
            fontWeight: 500,
            marginBottom: 28,
            backdropFilter: "blur(8px)",
          }}
        >
          <span>⚡</span>
          Benchmarking · Speed · Tool Calling
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 24px",
            maxWidth: 800,
          }}
        >
          {"Benchmark Every LLM.".split(" ").map((word, i) => (
            <span
              key={i}
              className="hero-word"
              style={{
                display: "inline-block",
                opacity: 0,
                marginRight: "0.28em",
              }}
            >
              {word}
            </span>
          ))}
          <br />
          {"Side by Side.".split(" ").map((word, i) => (
            <span
              key={"b" + i}
              className="hero-word"
              style={{
                display: "inline-block",
                opacity: 0,
                marginRight: "0.28em",
                color: "var(--accent-hi)",
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          id="subtitle"
          style={{
            opacity: 0,
            fontSize: 18,
            color: "var(--ink-2)",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 0 32px",
          }}
        >
          Fire the same prompt at all your models simultaneously. Compare speed,
          quality, and tool-calling in real time.
        </p>

        {/* CTAs */}
        <div
          id="ctas"
          style={{
            opacity: 0,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {/* ── Task 2: Orb behind the "Open Arena" CTA ── */}
          <div
            style={{
              position: "relative",
              width: "fit-content",
              height: "fit-content",
            }}
          >
            {/* Orb glow behind */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 180,
                height: 80,
                zIndex: 0,
                pointerEvents: "none",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <Suspense fallback={null}>
                <Orb
                  hoverIntensity={0.6}
                  rotateOnHover={true}
                  hue={260}
                  forceHoverState={false}
                  backgroundColor="transparent"
                />
              </Suspense>
            </div>

            {/* Button on top */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <InteractiveHoverButton
                onClick={() => router.push("/arena")}
                style={{ fontSize: 15, padding: "12px 28px" }}
              >
                Open Arena →
              </InteractiveHoverButton>
            </div>
          </div>

          {/* Ghost button — no Orb, not the primary CTA */}
          <InteractiveHoverButton
            onClick={() =>
              window.open("https://github.com/Rahulpande7795", "_blank")
            }
            style={{
              backgroundColor: "transparent",
              border: "1.5px solid var(--border-s)",
              color: "var(--ink-2)",
              fontSize: 15,
              padding: "12px 28px",
            }}
          >
            View on GitHub
          </InteractiveHoverButton>
        </div>

        {/* ── Task 3: BorderGlow on the demo prompt bar ── */}
        <div
          id="demo-bar"
          style={{
            opacity: 0,
            width: "100%",
            maxWidth: 600,
            marginBottom: 16,
            cursor: "pointer",
          }}
          onClick={() =>
            router.push(
              `/arena?prompt=${encodeURIComponent(promptVal || "What is the capital of Australia?")}`,
            )
          }
        >
          <BorderGlow
            glowColor="139 92 246"
            backgroundColor="var(--bg-1)"
            borderRadius={20}
            glowRadius={80}
            glowIntensity={0.9}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              boxShadow: "var(--shadow-md)",
              backdropFilter: "blur(8px)",
            }}
          >
            <input
              ref={promptRef}
              value={promptVal}
              onChange={(e) => setPromptVal(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="What is the capital of Australia?"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "var(--ink)",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                pointerEvents: "auto",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(
                    `/arena?prompt=${encodeURIComponent(promptVal || "What is the capital of Australia?")}`,
                  );
                }
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: "var(--ink-4)",
                whiteSpace: "nowrap",
              }}
            >
              Try it →
            </span>
          </BorderGlow>
        </div>

        {/* Mini demo cards */}
        <div
          id="demo-cards"
          style={{
            opacity: 0,
            width: "100%",
            maxWidth: 640,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {DEMO_CONTENT.map((card, i) => (
            <MiniCard
              key={card.modelId}
              modelId={card.modelId}
              text={card.text}
              winner={i === 0}
              active={demoActive}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
