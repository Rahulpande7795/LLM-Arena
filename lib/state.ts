"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ArenaStore,
  ThemeMode,
  CardState,
  MetricsData,
  HistoryEntry,
  RunResult,
} from "@/types";

// ============================================================
// STORE
// ============================================================

export const useArenaStore = create<ArenaStore>()(
  persist(
    (set, get) => ({
      // ── Persisted state ──────────────────────────────────────
      baseUrl: "http://localhost:8000",
      apiKey: "",
      activeModels: ["mistral-24b", "llama-8b", "qwen-24b", "kimi-k2"],
      systemPrompt: "",
      showMetrics: true,
      autoScroll: true,
      modelEndpoints: {},
      theme: "dark" as ThemeMode,
      toolMode: false,
      webglEnabled: true,

      // ── Session state (reset on page load) ───────────────────
      history: [],
      metricsLog: [],
      runCount: 0,
      totalTokens: 0,
      ttftSamples: [],
      lastResults: {},
      cardStates: {},
      isRunning: false,
      activeToolCalls: {},

      // ── Actions ──────────────────────────────────────────────

      setTheme: (theme) => set({ theme }),

      toggleModel: (modelId) => {
        const { activeModels } = get();
        set({
          activeModels: activeModels.includes(modelId)
            ? activeModels.filter((id) => id !== modelId)
            : [...activeModels, modelId],
        });
      },

      setActiveModels: (models) => set({ activeModels: models }),

      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

      addHistoryEntry: (entry: HistoryEntry) => {
        const { history, runCount, totalTokens } = get();
        const entryTokens = Object.values(entry.results).reduce(
          (sum, r) => sum + (r.metrics?.tokens ?? 0),
          0
        );
        set({
          history: [entry, ...history].slice(0, 100), // keep last 100
          runCount: runCount + 1,
          totalTokens: totalTokens + entryTokens,
        });
      },

      setCardState: (modelId: string, state: CardState) =>
        set((s) => ({
          cardStates: { ...s.cardStates, [modelId]: state },
        })),

      updateMetric: (modelId: string, metrics: Partial<MetricsData>) =>
        set((s) => {
          const prev = s.lastResults[modelId];
          return {
            lastResults: {
              ...s.lastResults,
              [modelId]: {
                ...(prev ?? { modelId, modelName: modelId, text: "", timestamp: Date.now() }),
                metrics: {
                  ...(prev?.metrics ?? { ttft: 0, tps: 0, tokens: 0, latency: 0 }),
                  ...metrics,
                },
              } as RunResult,
            },
          };
        }),

      setRunning: (running) => set({ isRunning: running }),

      clearResults: () =>
        set({
          lastResults: {},
          cardStates: {},
          activeToolCalls: {},
        }),

      setBaseUrl: (url) => set({ baseUrl: url }),

      setApiKey: (key) => set({ apiKey: key }),

      setModelEndpoint: (modelId, url) =>
        set((s) => ({
          modelEndpoints: { ...s.modelEndpoints, [modelId]: url },
        })),

      toggleWebgl: () => set((s) => ({ webglEnabled: !s.webglEnabled })),

      toggleToolMode: () => set((s) => ({ toolMode: !s.toolMode })),

      setActiveToolCall: (modelId, tc) =>
        set((s) => ({
          activeToolCalls: { ...s.activeToolCalls, [modelId]: tc },
        })),

      clearToolCalls: () => set({ activeToolCalls: {} }),
    }),

    {
      name: "ia-store",
      // SSR-safe: only use localStorage in the browser
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,

      // Only persist these keys — session state resets on page load
      partialize: (state) => ({
        baseUrl: state.baseUrl,
        apiKey: state.apiKey,
        activeModels: state.activeModels,
        systemPrompt: state.systemPrompt,
        showMetrics: state.showMetrics,
        autoScroll: state.autoScroll,
        modelEndpoints: state.modelEndpoints,
        theme: state.theme,
        toolMode: state.toolMode,
        webglEnabled: state.webglEnabled,
      }),
    }
  )
);