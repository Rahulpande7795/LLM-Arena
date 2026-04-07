"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

// Components
import { Sidebar }          from "@/components/arena/Sidebar";
import { Topbar }           from "@/components/arena/Topbar";
import { ModelChipBar }     from "@/components/arena/ModelChipBar";
import { PromptBar }        from "@/components/arena/PromptBar";
import { ResponseGrid }     from "@/components/arena/ResponseGrid";
import { LeaderboardStrip } from "@/components/arena/LeaderboardStrip";
import { HistoryView }      from "@/components/arena/views/HistoryView";
import { SettingsView }     from "@/components/arena/views/SettingsView";

// Lazy-loaded modals
const SystemPromptModal = dynamic(() =>
  import("@/components/modals/SystemPromptModal").then((m) => ({ default: m.SystemPromptModal }))
);
const TemplatesModal = dynamic(() =>
  import("@/components/modals/TemplatesModal").then((m) => ({ default: m.TemplatesModal }))
);
const ExportModal = dynamic(() =>
  import("@/components/modals/ExportModal").then((m) => ({ default: m.ExportModal }))
);
const ShortcutsModal = dynamic(() =>
  import("@/components/modals/ShortcutsModal").then((m) => ({ default: m.ShortcutsModal }))
);

// WebGL background — SSR:false, purely decorative
const ParticleBackground = dynamic(
  () => import("@/components/webgl/ParticleBackground"),
  { ssr: false }
);

// Hooks & lib
import { useArenaStore }        from "@/hooks/useArenaStore";
import { useInference }         from "@/hooks/useInference";
import { useToolCalling }       from "@/hooks/useToolCalling";
import { useModelHealth }       from "@/hooks/useModelHealth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLenis }             from "@/hooks/useLenis";
import { useTheme }             from "@/hooks/useTheme";
import { useToast }             from "@/components/ui/ToastContainer";
import { MODELS }               from "@/lib/models";
import { resolveModelEndpoint } from "@/lib/endpoints";
import { generateId }           from "@/lib/uuid";

import type { ViewMode, MetricsData, ToolCallResult, RunResult } from "@/types";

// ============================================================
// SIDEBAR WIDTH CSS VAR
// ============================================================

function SidebarWidthVar({ collapsed }: { collapsed: boolean }) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "64px" : "268px"
    );
  }, [collapsed]);
  return null;
}

// ============================================================
// INNER PAGE  (needs Suspense because of useSearchParams)
// ============================================================

function ArenaPageInner() {
  const searchParams = useSearchParams();

  // ── Store ────────────────────────────────────────────────────
  const activeModels    = useArenaStore((s) => s.activeModels);
  const cardStates      = useArenaStore((s) => s.cardStates);
  const isRunning       = useArenaStore((s) => s.isRunning);
  const toolMode        = useArenaStore((s) => s.toolMode);
  const systemPrompt    = useArenaStore((s) => s.systemPrompt);
  const modelEndpoints  = useArenaStore((s) => s.modelEndpoints);
  const runCount        = useArenaStore((s) => s.runCount);
  const totalTokens     = useArenaStore((s) => s.totalTokens);
  const ttftSamples     = useArenaStore((s) => s.ttftSamples);
  const webglEnabled    = useArenaStore((s) => s.webglEnabled);

  const setCardState    = useArenaStore((s) => s.setCardState);
  const setRunning      = useArenaStore((s) => s.setRunning);
  const clearResults    = useArenaStore((s) => s.clearResults);
  const toggleModel     = useArenaStore((s) => s.toggleModel);
  const setActiveModels = useArenaStore((s) => s.setActiveModels);
  const addHistoryEntry = useArenaStore((s) => s.addHistoryEntry);
  const toggleToolMode  = useArenaStore((s) => s.toggleToolMode);

  // ── Local state ──────────────────────────────────────────────
  const [prompt,             setPrompt]             = useState("");
  const [currentView,        setCurrentView]        = useState<ViewMode>("compare");
  const [sidebarCollapsed,   setSidebarCollapsed]   = useState(false);
  const [mobileMenuOpen,     setMobileMenuOpen]     = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [shake,              setShake]              = useState(false);

  // Modal state
  const [systemPromptOpen, setSystemPromptOpen] = useState(false);
  const [templatesOpen,    setTemplatesOpen]    = useState(false);
  const [exportOpen,       setExportOpen]       = useState(false);
  const [shortcutsOpen,    setShortcutsOpen]    = useState(false);

  // Per-card streaming data
  const textsRef = useRef<Record<string, string>>({});
  const [texts,     setTexts]     = useState<Record<string, string>>({});
  const [metrics,   setMetrics]   = useState<Record<string, MetricsData | null>>({});
  const [toolCalls, setToolCalls] = useState<Record<string, ToolCallResult | null>>({});
  const [results,   setResults]   = useState<Record<string, RunResult>>({});
  const rafRef = useRef<number | null>(null);

  // ── Hooks ────────────────────────────────────────────────────
  const { runModel, cancelAll } = useInference();
  const { runModelWithTools }   = useToolCalling();
  const health                  = useModelHealth(activeModels);
  const { toggleTheme }         = useTheme();
  const toast                   = useToast();
  useLenis();

  // ── URL param pre-fill ───────────────────────────────────────
  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setPrompt(decodeURIComponent(p));
  }, [searchParams]);

  // ── Computed stats ───────────────────────────────────────────
  const avgTTFT =
    ttftSamples.length > 0
      ? Math.round(ttftSamples.reduce((a, b) => a + b, 0) / ttftSamples.length)
      : 0;

  const serverStatus: "connected" | "disconnected" | "checking" =
    Object.values(health).some((h) => h === "online")   ? "connected"    :
    Object.values(health).some((h) => h === "checking") ? "checking"     : "disconnected";

  const activeModelConfigs = MODELS.filter((m) => activeModels.includes(m.id));

  // ── handleRun ────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!prompt.trim()) {
      setShake(true);
      toast.error("Prompt is empty");
      return;
    }
    if (activeModels.length === 0) {
      toast.error("Select at least one model");
      return;
    }

    clearResults();
    setTexts({});
    setMetrics({});
    setToolCalls({});
    setResults({});
    textsRef.current = {};
    setLeaderboardVisible(false);
    setRunning(true);
    activeModels.forEach((id) => setCardState(id, "loading"));

    const runResults: Record<string, RunResult> = {};

    await Promise.allSettled(
      activeModelConfigs.map(async (model) => {
        const { modelName, extra } = resolveModelEndpoint(model.id, modelEndpoints);
        setCardState(model.id, "streaming");

        const commonConfig = {
          modelId:      model.id,
          modelName,
          prompt,
          systemPrompt,
          params:       { max_tokens: 4096, temperature: 0.6, top_p: 0.9 },
          extra,

          onToken: (token: string) => {
            textsRef.current[model.id] =
              (textsRef.current[model.id] ?? "") + token;
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
              setTexts({ ...textsRef.current });
              rafRef.current = null;
            });
          },

          onMetrics: (m: Partial<MetricsData>) => {
            setMetrics((prev) => ({
              ...prev,
              [model.id]: {
                ...(prev[model.id] ?? { ttft: 0, tps: 0, tokens: 0, latency: 0 }),
                ...m,
              } as MetricsData,
            }));
          },

          onDone: (result: RunResult) => {
            setCardState(model.id, result.cancelled ? "cancelled" : "done");
            runResults[model.id] = result;
            setResults((prev) => ({ ...prev, [model.id]: result }));
          },

          onError: (err: { message: string }) => {
            setCardState(model.id, "error");
            toast.error(`${model.label}: ${err.message}`);
          },

          onFallback: () => {
            toast.warning(`${model.label}: streaming failed, using fallback`);
          },
        };

        if (toolMode) {
          await runModelWithTools({
            ...commonConfig,
            onToolCall: (tc: ToolCallResult) => {
              setToolCalls((prev) => ({ ...prev, [model.id]: tc }));
            },
          });
        } else {
          await runModel(commonConfig);
        }
      })
    );

    setRunning(false);
    setLeaderboardVisible(true);

    if (Object.keys(runResults).length > 0) {
      addHistoryEntry({
        id:        generateId(),
        prompt,
        timestamp: Date.now(),
        models:    activeModels,
        results:   runResults,
      });
      const bestTPS = Math.max(
        ...Object.values(runResults).map((r) => r.metrics?.tps ?? 0)
      );
      toast.success(
        `Run complete · ${activeModels.length} model${activeModels.length !== 1 ? "s" : ""} · best TPS: ${bestTPS.toFixed(1)}`
      );
    }
  }, [
    prompt, activeModels, activeModelConfigs, systemPrompt, modelEndpoints,
    toolMode, clearResults, setRunning, setCardState, addHistoryEntry,
    runModel, runModelWithTools, toast,
  ]);

  // ── handleCancel ─────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    cancelAll();
    activeModels.forEach((id) => {
      const state = cardStates[id];
      if (state === "streaming" || state === "loading") setCardState(id, "cancelled");
    });
    setRunning(false);
  }, [cancelAll, activeModels, cardStates, setCardState, setRunning]);

  // ── handleClear ──────────────────────────────────────────────
  const handleClear = useCallback(() => {
    clearResults();
    setTexts({});
    setMetrics({});
    setToolCalls({});
    setResults({});
    textsRef.current = {};
    setLeaderboardVisible(false);
  }, [clearResults]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useKeyboardShortcuts({
    run:       handleRun,
    templates: () => setTemplatesOpen(true),
    export:    () => setExportOpen(true),
    clear:     handleClear,
    shortcuts: () => setShortcutsOpen(true),
    escape: () => {
      if (isRunning) handleCancel();
      setSystemPromptOpen(false);
      setTemplatesOpen(false);
      setExportOpen(false);
      setShortcutsOpen(false);
    },
    theme:      toggleTheme,
    fullscreen: () => {},
  });

  // ── Retry single model ───────────────────────────────────────
  const handleRetry = useCallback(
    async (modelId: string) => {
      const model = MODELS.find((m) => m.id === modelId);
      if (!model || !prompt.trim()) return;

      const { modelName, extra } = resolveModelEndpoint(modelId, modelEndpoints);
      setCardState(modelId, "streaming");
      textsRef.current[modelId] = "";
      setTexts((prev) => ({ ...prev, [modelId]: "" }));

      await runModel({
        modelId,
        modelName,
        prompt,
        systemPrompt,
        params: { max_tokens: 4096, temperature: 0.6, top_p: 0.9 },
        extra,
        onToken: (t) => {
          textsRef.current[modelId] = (textsRef.current[modelId] ?? "") + t;
          setTexts({ ...textsRef.current });
        },
        onMetrics: (m) =>
          setMetrics((prev) => ({
            ...prev,
            [modelId]: {
              ...(prev[modelId] ?? { ttft: 0, tps: 0, tokens: 0, latency: 0 }),
              ...m,
            } as MetricsData,
          })),
        onDone: (r) => {
          setCardState(modelId, r.cancelled ? "cancelled" : "done");
          setResults((prev) => ({ ...prev, [modelId]: r }));
        },
        onError: (e) => {
          setCardState(modelId, "error");
          toast.error(e.message);
        },
      });
    },
    [prompt, systemPrompt, modelEndpoints, runModel, setCardState, toast]
  );

  // ── Copy ─────────────────────────────────────────────────────
  const handleCopy = useCallback(
    (modelId: string) => {
      const text = texts[modelId] ?? "";
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Copied!"))
        .catch(() => toast.error("Copy failed"));
    },
    [texts, toast]
  );

  // ── Template select ──────────────────────────────────────────
  const handleTemplateSelect = useCallback(
    (templatePrompt: string, useTools: boolean) => {
      setPrompt(templatePrompt);
      setTemplatesOpen(false);
      if (useTools && !toolMode) toggleToolMode();
    },
    [toolMode, toggleToolMode]
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <SidebarWidthVar collapsed={sidebarCollapsed} />

      {/* WebGL particles — behind everything */}
      <Suspense fallback={null}>
        <ParticleBackground enabled={webglEnabled} />
      </Suspense>

      <div
        style={{
          display:         "flex",
          height:          "100dvh",
          overflow:        "hidden",
          backgroundColor: "transparent",
          position:        "relative",
          zIndex:          1,
        }}
      >
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          currentView={currentView}
          onViewChange={(v) => { setCurrentView(v); setMobileMenuOpen(false); }}
          stats={{ runCount, totalTokens, avgTTFT }}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main column */}
        <div
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            minWidth:      0,
            overflow:      "hidden",
          }}
        >
          <Topbar
            serverStatus={serverStatus}
            onMenuOpen={() => setMobileMenuOpen(true)}
            onShortcuts={() => setShortcutsOpen(true)}
          />

          <div
            style={{
              flex:          1,
              overflowY:     "auto",
              overflowX:     "hidden",
              display:       "flex",
              flexDirection: "column",
            }}
          >
            <AnimatePresence mode="wait">
              {currentView === "compare" && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: 8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <ModelChipBar
                    activeModels={activeModels}
                    health={health}
                    onToggle={toggleModel}
                    onSelectAll={() => setActiveModels(MODELS.map((m) => m.id))}
                    onSelectNone={() => setActiveModels([])}
                  />
                  <div style={{ flex: 1 }}>
                    <ResponseGrid
                      models={activeModelConfigs}
                      cardStates={cardStates}
                      texts={texts}
                      metrics={metrics}
                      toolCalls={toolCalls}
                      results={results}
                      onRetry={handleRetry}
                      onCopy={handleCopy}
                    />
                  </div>
                  <LeaderboardStrip results={results} visible={leaderboardVisible} />
                </motion.div>
              )}

              {currentView === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: 8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ flex: 1 }}
                >
                  <HistoryView />
                </motion.div>
              )}

              {currentView === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: 8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ flex: 1 }}
                >
                  <SettingsView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentView === "compare" && (
            <PromptBar
              value={prompt}
              onChange={setPrompt}
              onRun={handleRun}
              onCancel={handleCancel}
              onTemplates={() => setTemplatesOpen(true)}
              onSystemPrompt={() => setSystemPromptOpen(true)}
              running={isRunning}
              toolMode={toolMode}
              onToggleToolMode={toggleToolMode}
              shake={shake}
              onShakeEnd={() => setShake(false)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {systemPromptOpen && (
          <SystemPromptModal
            key="sys"
            isOpen={systemPromptOpen}
            onClose={() => setSystemPromptOpen(false)}
          />
        )}
        {templatesOpen && (
          <TemplatesModal
            key="tpl"
            isOpen={templatesOpen}
            onClose={() => setTemplatesOpen(false)}
            onSelect={handleTemplateSelect}
          />
        )}
        {exportOpen && (
          <ExportModal
            key="exp"
            isOpen={exportOpen}
            onClose={() => setExportOpen(false)}
            results={Object.values(results)}
            prompt={prompt}
            timestamp={Date.now()}
          />
        )}
        {shortcutsOpen && (
          <ShortcutsModal
            key="sho"
            isOpen={shortcutsOpen}
            onClose={() => setShortcutsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// DEFAULT EXPORT  — wrapped in Suspense for useSearchParams
// ============================================================

export default function ArenaPage() {
  return (
    <Suspense fallback={null}>
      <ArenaPageInner />
    </Suspense>
  );
}