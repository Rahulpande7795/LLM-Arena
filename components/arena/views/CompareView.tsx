"use client";

import { useMemo, useState } from "react";
import { useArenaStore } from "@/hooks/useArenaStore";
import { MODELS } from "@/lib/models";
import type { CardState, RunResult } from "@/types";

// ─── Type adapters ────────────────────────────────────────────────────────────
// CardState in this project is a string literal union (the status itself).
// RunResult is an object — we extract text + metrics from it defensively.

type StatusStr = CardState; // "idle"|"loading"|"streaming"|"done"|"error"|"cancelled"

interface RunMetrics {
  ttft?: number;
  tps?: number;
  tokenCount?: number;
}

function getText(result: RunResult | undefined): string {
  if (!result) return "";
  // Handle both: RunResult as string OR RunResult as object with .text
  if (typeof result === "string") return result as string;
  const r = result as unknown as Record<string, unknown>;
  return (r.text as string) ?? (r.content as string) ?? "";
}

function getMetrics(result: RunResult | undefined): RunMetrics {
  if (!result || typeof result === "string") return {};
  const r = result as unknown as Record<string, unknown>;
  return (r.metrics as RunMetrics) ?? {};
}

function getModelLabel(id: string): string {
  const model = MODELS.find((m) => m.id === id);
  if (!model) return id;
  const m = model as unknown as Record<string, unknown>;
  return (
    (m.label as string) ??
    (m.name as string) ??
    (m.displayName as string) ??
    id
  );
}

function getModelColor(id: string): string {
  const model = MODELS.find((m) => m.id === id);
  if (!model) return "var(--accent)";
  const m = model as unknown as Record<string, unknown>;
  return (m.color as string) ?? "var(--accent)";
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatMs(ms: number | undefined): string {
  if (ms === undefined || ms < 0) return "—";
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function formatTps(tps: number | undefined): string {
  if (!tps || tps <= 0) return "—";
  return `${tps.toFixed(1)} t/s`;
}

function metricColor(
  value: number | undefined,
  values: (number | undefined)[],
  higherIsBetter: boolean
): string {
  const nums = values.filter((v): v is number => v !== undefined && v > 0);
  if (nums.length < 2 || !value || value <= 0) return "var(--ink-3)";
  const best = higherIsBetter ? Math.max(...nums) : Math.min(...nums);
  const worst = higherIsBetter ? Math.min(...nums) : Math.max(...nums);
  if (value === best) return "var(--green)";
  if (value === worst) return "var(--red)";
  return "var(--ink-2)";
}

function diffTokens(a: string, b: string) {
  const wordsA = a.split(/(\s+)/);
  const setB = new Set(b.split(/(\s+)/).filter((w) => w.trim()));
  return wordsA.map((word) => ({
    word,
    onlyA: !!word.trim() && !setB.has(word),
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono,monospace)" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color, fontFamily: "var(--font-mono,monospace)" }}>
        {value}
      </span>
    </div>
  );
}

function ModelSelector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "var(--font-mono,monospace)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "var(--bg-2)",
          border: "1px solid var(--bg-3)",
          borderRadius: "var(--r-md,8px)",
          color: "var(--ink)",
          fontSize: 14,
          padding: "8px 32px 8px 12px",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ResponsePane({
  modelId,
  status,
  text,
  metrics,
  allTps,
  allTtft,
  allTokens,
}: {
  modelId: string;
  status: StatusStr;
  text: string;
  metrics: RunMetrics;
  allTps: (number | undefined)[];
  allTtft: (number | undefined)[];
  allTokens: (number | undefined)[];
}) {
  const color = getModelColor(modelId);
  const label = getModelLabel(modelId);

  const statusColors: Record<string, { bg: string; fg: string }> = {
    done:      { bg: "var(--green)22", fg: "var(--green)" },
    streaming: { bg: "var(--accent)22", fg: "var(--accent)" },
    error:     { bg: "var(--red)22", fg: "var(--red)" },
  };
  const sc = statusColors[status as string] ?? { bg: "var(--bg-3)", fg: "var(--ink-4)" };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--bg-3)" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}80` }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: "var(--r-sm,4px)", background: sc.bg, color: sc.fg, fontFamily: "var(--font-mono,monospace)", marginLeft: "auto", flexShrink: 0 }}>
          {status as string}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 16, justifyContent: "space-around", padding: "10px 12px", background: "var(--bg-2)", borderRadius: "var(--r-md,8px)", border: "1px solid var(--bg-3)" }}>
        <MetricBadge label="TTFT" value={formatMs(metrics.ttft)} color={metricColor(metrics.ttft, allTtft, false)} />
        <MetricBadge label="TPS"  value={formatTps(metrics.tps)} color={metricColor(metrics.tps, allTps, true)} />
        <MetricBadge label="Tokens" value={metrics.tokenCount !== undefined ? String(metrics.tokenCount) : "—"} color={metricColor(metrics.tokenCount, allTokens, true)} />
      </div>

      {/* Response text */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", background: "var(--bg-1)", borderRadius: "var(--r-md,8px)", border: "1px solid var(--bg-3)", fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)", minHeight: 200, maxHeight: 480, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {!text && (status as string) !== "error" && (
          <span style={{ color: "var(--ink-4)", fontStyle: "italic" }}>
            {(status as string) === "idle"    ? "No response yet — run a prompt first." :
             (status as string) === "loading" ? "Waiting for first token…" : ""}
          </span>
        )}
        {!text && (status as string) === "error" && (
          <span style={{ color: "var(--red)" }}>Error — check the Arena tab for details.</span>
        )}
        {text}
      </div>
    </div>
  );
}

function DiffPane({ textA, textB }: { textA: string; textB: string }) {
  const tokens = useMemo(() => diffTokens(textA, textB), [textA, textB]);

  if (!textA && !textB) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--ink-4)", fontStyle: "italic", fontSize: 14 }}>
        Diff will appear after both models respond.
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", background: "var(--bg-1)", borderRadius: "var(--r-md,8px)", border: "1px solid var(--bg-3)", fontSize: 14, lineHeight: 1.75, color: "var(--ink-2)", overflowY: "auto", maxHeight: 320, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ background: t.onlyA ? "var(--red)33" : "transparent", color: t.onlyA ? "var(--red)" : "inherit", borderRadius: 2 }}>
          {t.word}
        </span>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CompareView() {
  const { lastResults, cardStates } = useArenaStore();

  const availableIds = useMemo(() => {
    const ids = new Set<string>();
    if (lastResults) Object.keys(lastResults).forEach((id) => ids.add(id));
    Object.entries(cardStates).forEach(([id, st]) => {
      if ((st as unknown as string) !== "idle") ids.add(id);
    });
    return Array.from(ids);
  }, [lastResults, cardStates]);

  const [modelA, setModelA] = useState(availableIds[0] ?? MODELS[0]?.id ?? "");
  const [modelB, setModelB] = useState(availableIds[1] ?? MODELS[1]?.id ?? "");
  const [showDiff, setShowDiff] = useState(false);

  const selectOptions = MODELS.map((m) => ({ id: m.id, label: getModelLabel(m.id) }));

  const resultA = lastResults?.[modelA] as RunResult | undefined;
  const resultB = lastResults?.[modelB] as RunResult | undefined;
  const textA = getText(resultA);
  const textB = getText(resultB);
  const metricsA = getMetrics(resultA);
  const metricsB = getMetrics(resultB);
  const statusA = (cardStates[modelA] ?? "idle") as unknown as StatusStr;
  const statusB = (cardStates[modelB] ?? "idle") as unknown as StatusStr;

  const allTps    = [metricsA.tps,        metricsB.tps];
  const allTtft   = [metricsA.ttft,       metricsB.ttft];
  const allTokens = [metricsA.tokenCount, metricsB.tokenCount];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24, maxWidth: 1400, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Compare</h2>
          <p style={{ fontSize: 13, color: "var(--ink-4)", margin: "4px 0 0" }}>Side-by-side response comparison with metrics</p>
        </div>
        <button
          onClick={() => setShowDiff((v) => !v)}
          style={{ padding: "7px 14px", borderRadius: "var(--r-md,8px)", border: "1px solid var(--bg-3)", background: showDiff ? "var(--accent)" : "var(--bg-2)", color: showDiff ? "var(--bg)" : "var(--ink-2)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 200ms,color 200ms" }}
        >
          {showDiff ? "Hide diff" : "Show diff"}
        </button>
      </div>

      {/* Selectors */}
      <div style={{ display: "flex", gap: 12, padding: 16, background: "var(--bg-1)", borderRadius: "var(--r-lg,12px)", border: "1px solid var(--bg-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
        <ModelSelector label="Model A" value={modelA} onChange={setModelA} options={selectOptions} />
        <div style={{ paddingBottom: 10, color: "var(--ink-4)", fontSize: 18, fontWeight: 300, flexShrink: 0 }}>vs</div>
        <ModelSelector label="Model B" value={modelB} onChange={setModelB} options={selectOptions} />
      </div>

      {/* Empty state */}
      {availableIds.length === 0 && (
        <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--bg-1)", borderRadius: "var(--r-lg,12px)", border: "1px dashed var(--bg-3)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <p style={{ color: "var(--ink-3)", fontSize: 15, margin: 0 }}>Run a prompt from the Arena to compare results here.</p>
        </div>
      )}

      {/* Panes */}
      <div className="compare-panes" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <ResponsePane modelId={modelA} status={statusA} text={textA} metrics={metricsA} allTps={allTps} allTtft={allTtft} allTokens={allTokens} />
        <div style={{ width: 1, alignSelf: "stretch", background: "var(--bg-3)", flexShrink: 0 }} />
        <ResponsePane modelId={modelB} status={statusB} text={textB} metrics={metricsB} allTps={allTps} allTtft={allTtft} allTokens={allTokens} />
      </div>

      {/* Diff */}
      {showDiff && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--ink-4)" }}>
            <span style={{ fontWeight: 600, color: "var(--ink-3)" }}>Word diff</span>
            <span style={{ padding: "2px 8px", borderRadius: "var(--r-xs,3px)", background: "var(--red)22", color: "var(--red)" }}>only in A</span>
          </div>
          <DiffPane textA={textA} textB={textB} />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .compare-panes { flex-direction: column !important; } }
      `}</style>
    </div>
  );
}