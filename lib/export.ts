import type { RunResult } from "@/types";

interface ExportPayload {
  prompt: string;
  timestamp: number;
  results: RunResult[];
}

// ============================================================
// HELPERS
// ============================================================

function triggerDownload(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay so the download can start
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 19);
}

// ============================================================
// JSON
// ============================================================

export function exportJSON(payload: ExportPayload): void {
  const data = {
    exported_at: formatDate(Date.now()),
    prompt: payload.prompt,
    run_timestamp: formatDate(payload.timestamp),
    results: payload.results.map((r) => ({
      model_id: r.modelId,
      model_name: r.modelName,
      text: r.text,
      metrics: r.metrics,
      tool_call: r.toolCall ?? null,
      cancelled: r.cancelled ?? false,
      timestamp: formatDate(r.timestamp),
    })),
  };
  triggerDownload(
    JSON.stringify(data, null, 2),
    `llm-arena-${Date.now()}.json`,
    "application/json"
  );
}

// ============================================================
// CSV
// ============================================================

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCSV(payload: ExportPayload): void {
  const headers = [
    "model",
    "ttft_ms",
    "tps",
    "tokens",
    "latency_ms",
    "tool_support",
    "cancelled",
    "response_preview",
  ];

  const rows = payload.results.map((r) => [
    escapeCSV(r.modelId),
    String(r.metrics?.ttft ?? ""),
    String(r.metrics?.tps ?? ""),
    String(r.metrics?.tokens ?? ""),
    String(r.metrics?.latency ?? ""),
    r.metrics?.tool ?? "—",
    String(r.cancelled ?? false),
    escapeCSV((r.text ?? "").slice(0, 100).replace(/\n/g, " ")),
  ]);

  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );
  triggerDownload(
    content,
    `llm-arena-${Date.now()}.csv`,
    "text/csv"
  );
}

// ============================================================
// MARKDOWN
// ============================================================

export function exportMarkdown(payload: ExportPayload): void {
  const lines: string[] = [
    "# LLM Arena Export",
    "",
    `**Exported:** ${formatDate(Date.now())}`,
    `**Prompt:** ${payload.prompt}`,
    "",
    "---",
    "",
  ];

  for (const r of payload.results) {
    lines.push(`## ${r.modelId}`);
    lines.push("");
    lines.push("```");
    lines.push(`TTFT:    ${r.metrics?.ttft ?? "—"} ms`);
    lines.push(`TPS:     ${r.metrics?.tps ?? "—"}`);
    lines.push(`Tokens:  ${r.metrics?.tokens ?? "—"}`);
    lines.push(`Latency: ${r.metrics?.latency ?? "—"} ms`);
    lines.push(`Tool:    ${r.metrics?.tool ?? "—"}`);
    lines.push("```");
    lines.push("");
    lines.push(r.text ?? "_No response_");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  triggerDownload(
    lines.join("\n"),
    `llm-arena-${Date.now()}.md`,
    "text/markdown"
  );
}

// ============================================================
// PLAIN TEXT
// ============================================================

export function exportText(payload: ExportPayload): void {
  const lines: string[] = [
    "LLM ARENA EXPORT",
    "=".repeat(60),
    `Exported: ${formatDate(Date.now())}`,
    `Prompt:   ${payload.prompt}`,
    "=".repeat(60),
    "",
  ];

  for (const r of payload.results) {
    lines.push(`=== ${r.modelId.toUpperCase()} ===`);
    lines.push(
      `TTFT: ${r.metrics?.ttft ?? "—"}ms | TPS: ${r.metrics?.tps ?? "—"} | Tokens: ${r.metrics?.tokens ?? "—"} | Tool: ${r.metrics?.tool ?? "—"}`
    );
    lines.push("");
    lines.push(r.text ?? "(no response)");
    lines.push("");
    lines.push("-".repeat(60));
    lines.push("");
  }

  triggerDownload(
    lines.join("\n"),
    `llm-arena-${Date.now()}.txt`,
    "text/plain"
  );
}