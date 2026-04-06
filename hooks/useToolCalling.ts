"use client";

import { useCallback } from "react";
import { SERVER_CONFIG } from "@/lib/endpoints";
import { TOOL_DEFINITIONS, executeToolCall } from "@/lib/tools";
import { classifyError, createHttpError } from "@/lib/errors";
import type {
  MetricsData,
  RunResult,
  ClassifiedError,
  InferenceParams,
  ToolCallResult,
} from "@/types";

// ============================================================
// TYPES
// ============================================================

export interface ToolRunConfig {
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
  onToolCall:   (result: ToolCallResult) => void;
}

// Raw tool_call shape from the API
interface RawToolCall {
  id:       string;
  type:     "function";
  function: {
    name:      string;
    arguments: string;
  };
}

// ============================================================
// HELPERS
// ============================================================

function buildMessages(systemPrompt: string, userPrompt: string) {
  const msgs: { role: string; content: string }[] = [];
  if (systemPrompt.trim()) {
    msgs.push({ role: "system", content: systemPrompt });
  }
  msgs.push({ role: "user", content: userPrompt });
  return msgs;
}

// ============================================================
// HOOK
// ============================================================

export function useToolCalling() {
  const runModelWithTools = useCallback(
    async (config: ToolRunConfig): Promise<void> => {
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
        onToolCall,
      } = config;

      const startTime = performance.now();
      const baseMessages = buildMessages(systemPrompt, prompt);

      // ==============================================================
      // PHASE 1 — Tool detection (non-streaming)
      // ==============================================================

      const phase1Body = {
        model:        modelName,
        messages:     baseMessages,
        stream:       false,
        tools:        TOOL_DEFINITIONS,
        tool_choice:  "auto",
        max_tokens:   1024,
        temperature:  params.temperature,
        top_p:        params.top_p,
        ...extra,
      };

      let phase1Data: {
        choices?: Array<{
          finish_reason?: string;
          message?: {
            content?:    string;
            tool_calls?: RawToolCall[];
          };
        }>;
      };

      try {
        const phase1Res = await fetch(
          SERVER_CONFIG.baseUrl + SERVER_CONFIG.apiPath,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(phase1Body),
          }
        );

        if (!phase1Res.ok) {
          throw createHttpError(phase1Res.status, `HTTP ${phase1Res.status}`);
        }

        phase1Data = await phase1Res.json();
      } catch (err) {
        const classified = classifyError(err);
        if (classified) onError(classified);
        return;
      }

      const choice       = phase1Data?.choices?.[0];
      const finishReason = choice?.finish_reason;

      // ── Model chose NOT to call any tool ──────────────────────
      if (finishReason !== "tool_calls") {
        const text = choice?.message?.content ?? "";
        const latency = Math.round(performance.now() - startTime);

        onMetrics({ tool: "✗" });

        // Stream the content char by char for visual effect
        for (const char of text) {
          onToken(char);
        }

        onDone({
          modelId,
          modelName,
          text,
          metrics: {
            ttft:    latency,
            tps:     0,
            tokens:  Math.ceil(text.split(/\s+/).length * 1.3),
            latency,
            tool:    "✗",
          },
          cancelled: false,
          timestamp: Date.now(),
        });
        return;
      }

      // ── Model called tool(s) ──────────────────────────────────
      const rawToolCalls: RawToolCall[] = choice?.message?.tool_calls ?? [];
      const toolResultMessages: { role: string; tool_call_id: string; content: string }[] = [];

      for (const tc of rawToolCalls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }

        // Notify UI — status "running"
        onToolCall({
          toolName:  tc.function.name,
          args,
          result:    null,
          status:    "running",
          timestamp: Date.now(),
        });

        // Execute mock tool
        let result: Record<string, unknown>;
        try {
          result = await executeToolCall(tc.function.name, args);
        } catch {
          result = { error: "Tool execution failed" };
        }

        // Notify UI — status "done"
        onToolCall({
          toolName:  tc.function.name,
          args,
          result,
          status:    "done",
          timestamp: Date.now(),
        });

        toolResultMessages.push({
          role:         "tool",
          tool_call_id: tc.id,
          content:      JSON.stringify(result),
        });
      }

      // Mark tool as supported in metrics
      onMetrics({ tool: "✓" });

      // ==============================================================
      // PHASE 2 — Final answer (streaming)
      // ==============================================================

      const phase2Messages = [
        ...baseMessages,
        // Assistant turn that triggered the tool call
        {
          role:       "assistant",
          content:    null,
          tool_calls: rawToolCalls,
        },
        // Tool result(s)
        ...toolResultMessages,
      ];

      const phase2Body = {
        model:       modelName,
        messages:    phase2Messages,
        stream:      true,
        max_tokens:  params.max_tokens,
        temperature: params.temperature,
        top_p:       params.top_p,
      };

      let ttft:        number | null = null;
      let tokenCount                 = 0;
      let accumulated                = "";

      try {
        const phase2Res = await fetch(
          SERVER_CONFIG.baseUrl + SERVER_CONFIG.apiPath,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(phase2Body),
          }
        );

        if (!phase2Res.ok) {
          throw createHttpError(phase2Res.status, `HTTP ${phase2Res.status}`);
        }

        const reader  = phase2Res.body!.getReader();
        const decoder = new TextDecoder();
        let   buffer  = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (data === "[DONE]") break outer;

            let chunk: {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            try {
              chunk = JSON.parse(data);
            } catch {
              continue;
            }

            const content = chunk?.choices?.[0]?.delta?.content;
            if (!content) continue;

            if (ttft === null) ttft = performance.now() - startTime;

            tokenCount++;
            accumulated += content;
            onToken(content);

            const elapsed = performance.now() - startTime;
            const tps =
              tokenCount / Math.max((elapsed - (ttft ?? 0)) / 1000, 0.001);

            onMetrics({
              ttft:    Math.round(ttft),
              tps:     Math.round(tps * 10) / 10,
              tokens:  tokenCount,
              latency: Math.round(elapsed),
              tool:    "✓",
            });
          }
        }

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
            tool:    "✓",
          },
          cancelled: false,
          timestamp: Date.now(),
        });

      } catch (err) {
        const classified = classifyError(err);
        if (classified) onError(classified);
      }
    },
    []
  );

  return { runModelWithTools };
}