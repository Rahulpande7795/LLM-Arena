"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const QUICKSTART = `git clone https://github.com/Rahulpande7795/llm-arena
cd llm-arena && npm install && npm run dev`;

export function FinalCTA() {
  const router  = useRouter();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(QUICKSTART).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section
      style={{
        padding:         "100px 24px",
        textAlign:       "center",
        backgroundColor: "var(--bg-1)",
        borderTop:       "1px solid var(--border)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ maxWidth: 640, margin: "0 auto" }}
      >
        <h2
          style={{
            fontWeight:   800,
            fontSize:     "clamp(28px, 4vw, 44px)",
            color:        "var(--ink)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Start benchmarking in 60 seconds
        </h2>

        <p
          style={{
            fontSize:     18,
            color:        "var(--ink-3)",
            lineHeight:   1.65,
            marginBottom: 36,
          }}
        >
          Self-hosted. No data leaves your network.
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/arena")}
        >
          Open Arena →
        </Button>

        {/* Code block */}
        <div
          style={{
            marginTop:       36,
            position:        "relative",
            backgroundColor: "var(--bg)",
            borderRadius:    "var(--r-lg)",
            boxShadow:       "var(--shadow-md)",
            border:          "1px solid var(--border)",
            padding:         "16px 20px",
            textAlign:       "left",
          }}
        >
          <pre
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize:   13,
              color:      "var(--ink-2)",
              margin:     0,
              lineHeight: 1.7,
              overflow:   "auto",
              paddingRight: 48,
            }}
          >
            {QUICKSTART}
          </pre>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              position:        "absolute",
              top:             10,
              right:           10,
              background:      "none",
              border:          "1px solid var(--border-s)",
              borderRadius:    "var(--r-sm)",
              color:           copied ? "var(--green)" : "var(--ink-4)",
              fontFamily:      "var(--font-jetbrains-mono), monospace",
              fontSize:        12,
              padding:         "4px 10px",
              cursor:          "pointer",
              transition:      "all 150ms ease-out",
            }}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <p
        style={{
          marginTop:  48,
          fontSize:   14,
          color:      "var(--ink-4)",
          textAlign:  "center",
        }}
      >
        © 2025 LLM Arena · MIT License ·{" "}
        <a
          href="https://github.com/Rahulpande7795"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--ink-4)", textDecoration: "underline" }}
        >
          GitHub
        </a>
      </p>
    </section>
  );
}