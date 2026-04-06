"use client";

import React, { useState } from "react";
import { useArenaStore } from "@/hooks/useArenaStore";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { MODELS } from "@/lib/models";
import { SERVER_CONFIG } from "@/lib/endpoints";
import { useToast } from "@/components/ui/ToastContainer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "0 0 14px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
      <label style={{ fontSize: 14, color: "var(--ink-2)", flexShrink: 0 }}>{label}</label>
      <div style={{ flex: 1, maxWidth: 320 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:           "100%",
  padding:         "7px 12px",
  backgroundColor: "var(--bg-2)",
  border:          "1.5px solid var(--border-s)",
  borderRadius:    "var(--r-md)",
  color:           "var(--ink)",
  fontSize:        14,
  outline:         "none",
  fontFamily:      "var(--font-jetbrains-mono), monospace",
  boxSizing:       "border-box",
};

export function SettingsView() {
  const store     = useArenaStore();
  const { theme, setTheme } = useTheme();
  const toast     = useToast();
  const [showKey, setShowKey] = useState(false);
  const [pinging, setPinging] = useState(false);

  async function pingServer() {
    setPinging(true);
    try {
      const res = await fetch(`${store.baseUrl}/health`);
      if (res.ok) toast.success("Server connected ✓");
      else        toast.error(`Server returned ${res.status}`);
    } catch {
      toast.error("Cannot reach server — is it running?");
    }
    setPinging(false);
  }

  return (
    <div style={{ padding: "20px 24px", maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "var(--ink)", margin: "0 0 24px" }}>Settings</h2>

      {/* ── Server ── */}
      <Section title="Server">
        <Field label="Proxy URL">
          <input style={inputStyle} value={store.baseUrl} onChange={(e) => store.setBaseUrl(e.target.value)} />
        </Field>
        <Field label="API Key">
          <div style={{ display: "flex", gap: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              type={showKey ? "text" : "password"}
              value={store.apiKey}
              onChange={(e) => store.setApiKey(e.target.value)}
              placeholder="nvapi-…"
            />
            <Button variant="ghost" size="sm" onClick={() => setShowKey((s) => !s)}>
              {showKey ? "Hide" : "Show"}
            </Button>
          </div>
        </Field>
        <Button variant="ghost" size="sm" loading={pinging} onClick={pingServer}>
          Ping Server
        </Button>
      </Section>

      {/* ── Model Endpoints ── */}
      <Section title="Model Endpoints">
        <p style={{ fontSize: 13, color: "var(--ink-4)", marginBottom: 12 }}>
          Override the default endpoint for a specific model. Leave blank to use the proxy default.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MODELS.map((model) => (
            <div key={model.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 130px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: model.color, display: "inline-block" }} />
                <span style={{ fontSize: 13, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {model.label}
                </span>
              </span>
              <input
                style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                placeholder={`${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.apiPath}`}
                value={store.modelEndpoints[model.id] ?? ""}
                onChange={(e) => store.setModelEndpoint(model.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Display ── */}
      <Section title="Display">
        <Field label="Show Metrics">
          <ToggleSwitch checked={store.showMetrics} onChange={(v) => useArenaStore.setState({ showMetrics: v })} />
        </Field>
        <Field label="Auto Scroll">
          <ToggleSwitch checked={store.autoScroll} onChange={(v) => useArenaStore.setState({ autoScroll: v })} />
        </Field>
        <Field label="WebGL Background">
          <ToggleSwitch checked={store.webglEnabled} onChange={() => store.toggleWebgl()} />
        </Field>
        <Field label="Theme">
          <div style={{ display: "flex", gap: 6 }}>
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding:         "6px 16px",
                  borderRadius:    "var(--r-full)",
                  border:          "1.5px solid var(--border-s)",
                  backgroundColor: theme === t ? "var(--accent)" : "transparent",
                  color:           theme === t ? "white"          : "var(--ink-3)",
                  fontSize:        13,
                  fontWeight:      theme === t ? 600              : 400,
                  cursor:          "pointer",
                  transition:      "all 150ms ease-out",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Run Parameters ── */}
      <Section title="Run Parameters">
        <p style={{ fontSize: 13, color: "var(--ink-4)", marginBottom: 12 }}>Advanced controls coming soon.</p>
        {[["Max Tokens", "4096"], ["Temperature", "0.6"], ["Top P", "0.9"]].map(([label, val]) => (
          <Field key={label} label={label}>
            <input style={{ ...inputStyle, opacity: 0.6 }} value={val} disabled />
          </Field>
        ))}
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone">
        <div style={{ border: "1px solid color-mix(in srgb, var(--red) 25%, transparent)", borderRadius: "var(--r-lg)", padding: 16 }}>
          <p style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 12px" }}>
            Clear all session data — history, metrics, results.
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              store.clearResults();
              useArenaStore.setState({ history: [], metricsLog: [], runCount: 0, totalTokens: 0, ttftSamples: [] });
              toast.success("Session data cleared");
            }}
          >
            Clear Session Data
          </Button>
        </div>
      </Section>
    </div>
  );
}