"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TEMPLATES } from "@/lib/templates";
import { SHORTCUT_LABELS } from "@/lib/shortcuts";
import type { ShortcutKey } from "@/types";

// ============================================================
// TILE WRAPPER
// ============================================================

function Tile({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--bg-1)",
        borderRadius:    "var(--r-xl)",
        padding:         "24px",
        boxShadow:       "var(--shadow-md)",
        overflow:        "hidden",
        transition:      "transform 200ms ease-out, box-shadow 200ms ease-out",
        height:          "100%", // ensure height is filled
        ...style,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform  = "scale(1.015)";
        el.style.boxShadow  = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform  = "scale(1)";
        el.style.boxShadow  = "var(--shadow-md)";
      }}
    >
      {children}
    </div>
  );
}

function TileTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: "0 0 8px" }}>
      {children}
    </h3>
  );
}

function TileDesc({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
      {children}
    </p>
  );
}

// ============================================================
// TILE 1 — Streaming demo
// ============================================================

function StreamingTile() {
  const [text, setText] = useState("");
  const fullText = "The transformer architecture uses self-attention to weigh the importance of different tokens in a sequence. Unlike RNNs, it processes all tokens in parallel, enabling massive scalability...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % (fullText.length + 20);
      setText(i < fullText.length ? fullText.slice(0, i) : "");
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🌊</span>
        <TileTitle>Real-time SSE Streaming</TileTitle>
      </div>
      <TileDesc>Watch tokens stream in as fast as the model generates them. No waiting for the full response.</TileDesc>

      {/* Live text demo */}
      <div
        style={{
          marginTop:       20,
          padding:         "14px 16px",
          backgroundColor: "var(--bg-2)",
          borderRadius:    "var(--r-lg)",
          fontFamily:      "var(--font-plus-jakarta-sans), sans-serif",
          fontSize:        14,
          color:           "var(--ink-2)",
          lineHeight:      1.7,
          minHeight:       120,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-plus-jakarta-sans)" }}>Mistral 24B</span>
          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, color: "var(--amber)", backgroundColor: "color-mix(in srgb, var(--amber) 15%, transparent)", padding: "1px 5px", borderRadius: "3px" }}>STREAMING</span>
        </div>
        {text}
        <span style={{ display: "inline-block", width: 2, height: "1em", backgroundColor: "var(--accent)", marginLeft: 1, verticalAlign: "text-bottom", animation: "blink-cursor 0.7s step-end infinite" }} />
      </div>
    </Tile>
  );
}

// ============================================================
// TILE 2 — Tool calling
// ============================================================

function ToolCallingTile() {
  const rows = [
    { model: "mistral-24b", color: "#8b5cf6", supports: true  },
    { model: "kimi-k2",     color: "#a78bfa", supports: true  },
    { model: "llama-8b",    color: "#f97316", supports: false },
    { model: "qwen-72b",    color: "#ec4899", supports: true  },
  ];
  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <TileTitle>Tool Calling Detection</TileTitle>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((r) => (
          <div key={r.model} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", backgroundColor: "var(--bg-2)", borderRadius: "var(--r-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: r.color }} />
              <span style={{ fontSize: 13, color: "var(--ink-2)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>{r.model}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: r.supports ? "var(--green)" : "var(--red)" }}>
              {r.supports ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

// ============================================================
// TILE 3 — Templates
// ============================================================

function TemplatesTile() {
  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>📝</span>
        <TileTitle>13 Prompt Templates</TileTitle>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden", maskImage: "linear-gradient(to bottom, black 70%, transparent)" }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", backgroundColor: "var(--bg-2)", borderRadius: "var(--r-md)" }}>
            {t.useTools && <span style={{ fontSize: 11, color: "var(--amber)" }}>⚡</span>}
            <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

// ============================================================
// TILE 4 — Exports
// ============================================================

function ExportsTile() {
  const fmts = [
    { icon: "{ }", label: "JSON" },
    { icon: "≡",   label: "CSV"  },
    { icon: "#",   label: "MD"   },
    { icon: "Aa",  label: "TXT"  },
  ];
  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>📦</span>
        <TileTitle>4 Export Formats</TileTitle>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {fmts.map((f) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", backgroundColor: "var(--bg-2)", borderRadius: "var(--r-md)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700, color: "var(--accent-hi)" }}>{f.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>{f.label}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

// ============================================================
// TILE 5 — Theme
// ============================================================

function ThemeTile() {
  const [dark, setDark] = useState(true);
  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{dark ? "🌙" : "☀️"}</span>
        <TileTitle>Dark & Light Theme</TileTitle>
      </div>
      <button
        onClick={() => setDark((d) => !d)}
        style={{
          width:           "100%",
          padding:         "10px",
          borderRadius:    "var(--r-lg)",
          border:          "1.5px solid var(--border-s)",
          backgroundColor: "var(--bg)",
          color:           "var(--ink)",
          fontSize:        13,
          cursor:          "pointer",
          fontWeight:      500,
          transition:      "all 200ms ease-out",
        }}
      >
        {dark ? "Switch to Light →" : "Switch to Dark →"}
      </button>
    </Tile>
  );
}

// ============================================================
// TILE 6 — Shortcuts
// ============================================================

function ShortcutsTile() {
  const keys: ShortcutKey[] = ["run", "templates", "export"];
  return (
    <Tile>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>⌨️</span>
        <TileTitle>Keyboard Shortcuts</TileTitle>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {keys.map((k) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {SHORTCUT_LABELS[k].keys.map((key, i) => (
                <React.Fragment key={key}>
                  <kbd style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, padding: "2px 6px", borderRadius: "var(--r-xs)", backgroundColor: "var(--bg-2)", border: "1px solid var(--border-s)", color: "var(--ink-2)" }}>{key}</kbd>
                  {i < SHORTCUT_LABELS[k].keys.length - 1 && <span style={{ fontSize: 10, color: "var(--ink-4)" }}>+</span>}
                </React.Fragment>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{SHORTCUT_LABELS[k].description.split(" ").slice(0, 3).join(" ")}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" }
  }
};

export function FeaturesBento() {
  return (
    <section style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", textAlign: "center", color: "var(--ink)", marginBottom: 48, letterSpacing: "-0.02em" }}>
          Everything You Need
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows:        "auto",
            gap:                 16,
          }}
        >
          <motion.div variants={itemVariants} style={{ gridColumn: "span 2", gridRow: "span 2" }}><StreamingTile /></motion.div>
          <motion.div variants={itemVariants} style={{ gridColumn: "span 2" }}><ToolCallingTile /></motion.div>
          <motion.div variants={itemVariants} style={{ gridRow: "span 2" }}><TemplatesTile /></motion.div>
          <motion.div variants={itemVariants}><ExportsTile /></motion.div>
          <motion.div variants={itemVariants}><ThemeTile /></motion.div>
          <motion.div variants={itemVariants}><ShortcutsTile /></motion.div>
        </motion.div>
      </div>
    </section>
  );
}