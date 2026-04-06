"use client";

import { useRef, useCallback } from "react";
import { SERVER_CONFIG } from "@/lib/endpoints";
import { classifyError, createHttpError } from "@/lib/errors";
import { useSSEFallback } from "./useSSEFallback";
import type {
  MetricsData,
  RunResult,
  ClassifiedError,
  InferenceParams,
} from "@/types";

// ============================================================
// TYPES
// ============================================================

export interface RunModelConfig {
  modelId:      string;
  modelName:    string;
  prompt:       string;
  systemPrompt: string;
  params:       InferenceParams;
  extra:        Record<string, unknown>;
  onToken:      (token: string) => void;
  onMetrics:    (metrics: Partial<MetricsData>) => void;
  onDone:       (result: RunResult) => void;
  onError:      (err: ClassifiedError) => void;
  /** Called when SSE fails and we fall back to non-streaming */
  onFallback?:  () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useInference() {
  // Map of modelId → AbortController
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const { runFallback } = useSSEFallback();

  // ── cancelModel ────────────────────────────────────────────
  const cancelModel = useCallback((modelId: string) => {
    controllers.current.get(modelId)?.abort();
    controllers.current.delete(modelId);
  }, []);

  // ── cancelAll ──────────────────────────────────────────────
  const cancelAll = useCallback(() => {
    controllers.current.forEach((ctrl) => ctrl.abort());
    controllers.current.clear();
  }, []);

  // ── runModel ───────────────────────────────────────────────
  const runModel = useCallback(
    async (config: RunModelConfig): Promise<void> => {
      const {
        modelId,
        modelName,
        prompt,
        systemPrompt,
        params,
        extra,
        onToken,
        onMetrics,
        onDone,
        onError,
        onFallback,
      } = config;

      // Cancel any existing run for this model
      cancelModel(modelId);

      const controller = new AbortController();
      controllers.current.set(modelId, controller);

      // Build messages array
      const messages: { role: string; content: string }[] = [];
      if (systemPrompt.trim()) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      // Build request body
      const body = {
        model:       modelName,
        messages,
        stream:      true,
        max_tokens:  params.max_tokens,
        temperature: params.temperature,
        top_p:       params.top_p,
        ...extra,
      };

      const startTime    = performance.now();
      let   ttft:  number | null = null;
      let   tokenCount           = 0;
      let   accumulated          = "";
      let   streamStarted        = false;

      // 8-second timeout for first token
      const firstTokenTimeout = setTimeout(() => {
        if (!streamStarted) {
          controller.abort();
        }
      }, 8000);

      try {
        const response = await fetch(
          SERVER_CONFIG.baseUrl + SERVER_CONFIG.apiPath,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
            signal:  controller.signal,
          }
        );

        if (!response.ok) {
          clearTimeout(firstTokenTimeout);
          throw createHttpError(response.status, `HTTP ${response.status}`);
        }

        if (!response.body) {
          clearTimeout(firstTokenTimeout);
          throw new Error("Response body is null");
        }

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = "";

        // ── SSE parsing loop ──────────────────────────────────
        outer: while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on newlines — keep incomplete last line in buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            const line = raw.trim();

            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();

            // Stream end sentinel
            if (data === "[DONE]") {
              clearTimeout(firstTokenTimeout);
              break outer;
            }

            // Parse JSON chunk
            let chunk: {
              choices?: Array<{
                delta?:         { content?: string };
                finish_reason?: string | null;
              }>;
            };

            try {
              chunk = JSON.parse(data);
            } catch {
              // Skip malformed chunks — common with some model providers
              continue;
            }

            const content = chunk?.choices?.[0]?.delta?.content;

            // Skip empty deltas
            if (!content) continue;

            // Mark that we've received our first token
            streamStarted = true;
            clearTimeout(firstTokenTimeout);

            // TTFT: time to first token
            if (ttft === null) {
              ttft = performance.now() - startTime;
            }

            tokenCount++;
            accumulated += content;

            // Call token handler
            onToken(content);

            // Update metrics on every token
            const elapsed = performance.now() - startTime;
            const tps =
              tokenCount /
              Math.max((elapsed - (ttft ?? 0)) / 1000, 0.001);

            onMetrics({
              ttft:    Math.round(ttft),
              tps:     Math.round(tps * 10) / 10,
              tokens:  tokenCount,
              latency: Math.round(elapsed),
            });
          }
        }

        clearTimeout(firstTokenTimeout);

        // Clean up controller ref
        controllers.current.delete(modelId);

        // Final result
        const finalLatency = Math.round(performance.now() - startTime);
        const finalTPS =
          tokenCount > 0
            ? Math.round(
                (tokenCount /
                  Math.max((finalLatency - (ttft ?? 0)) / 1000, 0.001)) *
                  10
              ) / 10
            : 0;

        onDone({
          modelId,
          modelName,
          text: accumulated,
          metrics: {
            ttft:    Math.round(ttft ?? finalLatency),
            tps:     finalTPS,
            tokens:  tokenCount,
            latency: finalLatency,
            tool:    "—",
          },
          cancelled:  false,
          timestamp:  Date.now(),
        });

      } catch (err: unknown) {
        clearTimeout(firstTokenTimeout);
        controllers.current.delete(modelId);

        // ── AbortError = user cancelled ───────────────────────
        if (
          err instanceof DOMException &&
          (err.name === "AbortError" || err.name === "TimeoutError")
        ) {
          onDone({
            modelId,
            modelName,
            text:      accumulated,
            metrics:   {
              ttft:    Math.round(ttft ?? 0),
              tps:     0,
              tokens:  tokenCount,
              latency: Math.round(performance.now() - startTime),
              tool:    "—",
            },
            cancelled: true,
            timestamp: Date.now(),
          });
          return;
        }

        // ── Network / HTTP errors → try non-streaming fallback ─
        const isNetworkError =
          err instanceof TypeError &&
          (err.message.includes("fetch") ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("network"));

        const isHttpError =
          (err as { status?: number })?.status !== undefined;

        if (isNetworkError || isHttpError) {
          // Notify UI that fallback is triggering
          onFallback?.();

          await runFallback({
            modelId,
            modelName,
            prompt,
            systemPrompt,
            params,
            extra,
            onFallbackTriggered: () => {}, // already called above
            onDone,
            onError,
          });
          return;
        }

        // ── All other errors ──────────────────────────────────
        const classified = classifyError(err);
        if (classified) onError(classified);
      }
    },
    [cancelModel, runFallback]
  );

  return { runModel, cancelModel, cancelAll };
}