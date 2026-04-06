"use client";

import { useCallback } from "react";
import { SERVER_CONFIG } from "@/lib/endpoints";
import { classifyError } from "@/lib/errors";
import type { MetricsData, RunResult, ClassifiedError, InferenceParams } from "@/types";

// ============================================================
// TYPES
// ============================================================

interface FallbackConfig {
  modelId:              string;
  modelName:            string;
  prompt:               string;
  systemPrompt:         string;
  params:               InferenceParams;
  extra:                Record<string, unknown>;
  signal?:              AbortSignal;
  onFallbackTriggered:  () => void;
  onDone:               (result: RunResult) => void;
  onError:              (err: ClassifiedError) => void;
}

// ============================================================
// HOOK
// ============================================================

export function useSSEFallback() {
  const runFallback = useCallback(async (config: FallbackConfig) => {
    const {
      modelId,
      modelName,
      prompt,
      systemPrompt,
      params,
      extra,
      signal,
      onFallbackTriggered,
      onDone,
      onError,
    } = config;

    const startTime = performance.now();

    // Build messages
    const messages: { role: string; content: string }[] = [];
    if (systemPrompt.trim()) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    // Build request body — stream: false
    const body = {
      model:       modelName,
      messages,
      stream:      false,
      max_tokens:  params.max_tokens,
      temperature: params.temperature,
      top_p:       params.top_p,
      ...extra,
    };

    try {
      const response = await fetch(
        SERVER_CONFIG.baseUrl + SERVER_CONFIG.apiPath,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
          signal,
        }
      );

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`) as Error & { status: number };
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const text: string = data?.choices?.[0]?.message?.content ?? "";
      const totalLatency = Math.round(performance.now() - startTime);

      // Notify caller — they will show a warning toast
      onFallbackTriggered();

      const metrics: MetricsData = {
        ttft:    totalLatency,
        tps:     0, // no streaming → no per-token timing
        tokens:  Math.ceil(text.split(/\s+/).length * 1.3), // rough estimate
        latency: totalLatency,
        tool:    "—",
      };

      onDone({
        modelId,
        modelName,
        text,
        metrics,
        cancelled:  false,
        timestamp:  Date.now(),
      });

    } catch (err: unknown) {
      // Never trigger fallback on abort
      if (
        err instanceof DOMException &&
        (err.name === "AbortError" || err.name === "TimeoutError")
      ) {
        onDone({
          modelId,
          modelName,
          text:      "",
          metrics:   { ttft: 0, tps: 0, tokens: 0, latency: 0, tool: "—" },
          cancelled: true,
          timestamp: Date.now(),
        });
        return;
      }

      const classified = classifyError(err);
      if (classified) onError(classified);
    }
  }, []);

  return { runFallback };
}