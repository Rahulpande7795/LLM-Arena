"use client";

import { useState, useEffect, useRef } from "react";
import { SERVER_CONFIG } from "@/lib/endpoints";
import { MODELS } from "@/lib/models";

// ============================================================
// TYPES
// ============================================================

export type HealthStatus = "online" | "offline" | "unknown" | "checking";

// ============================================================
// HOOK
// ============================================================

export function useModelHealth(
  modelIds: string[]
): Record<string, HealthStatus> {
  const [health, setHealth] = useState<Record<string, HealthStatus>>(() =>
    Object.fromEntries(modelIds.map((id) => [id, "checking"]))
  );

  // Cache survives chip re-renders
  const cache = useRef<Record<string, HealthStatus>>({});

  useEffect(() => {
    if (modelIds.length === 0) return;

    // Initialise any new model as "checking"
    setHealth((prev) => {
      const next = { ...prev };
      for (const id of modelIds) {
        if (!(id in next)) next[id] = "checking";
      }
      return next;
    });

    // Delay first probe so it doesn't block initial render
    const timeout = setTimeout(() => {
      for (const modelId of modelIds) {
        // Use cache if available
        if (cache.current[modelId] && cache.current[modelId] !== "checking") {
          setHealth((prev) => ({ ...prev, [modelId]: cache.current[modelId] }));
          continue;
        }

        probeModel(modelId).then((status) => {
          cache.current[modelId] = status;
          setHealth((prev) => ({ ...prev, [modelId]: status }));
        });
      }
    }, 1200);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelIds.join(",")]);

  return health;
}

// ============================================================
// PROBE FUNCTION
// ============================================================

async function probeModel(modelId: string): Promise<HealthStatus> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return "unknown";

  try {
    const response = await fetch(
      SERVER_CONFIG.baseUrl + SERVER_CONFIG.apiPath,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:       model.fullName,
          messages:    [{ role: "user", content: "hi" }],
          stream:      false,
          max_tokens:  1,
        }),
        signal: AbortSignal.timeout(6000),
      }
    );

    if (response.ok) return "online";

    const status = response.status;
    if (status === 401 || status === 403 || status === 404) return "offline";
    if (status >= 500) return "unknown";

    return "unknown";

  } catch (err: unknown) {
    // Timeout or network error
    if (
      err instanceof DOMException &&
      (err.name === "TimeoutError" || err.name === "AbortError")
    ) {
      return "unknown";
    }
    if (err instanceof TypeError) {
      // Proxy server not running
      return "unknown";
    }
    return "unknown";
  }
}