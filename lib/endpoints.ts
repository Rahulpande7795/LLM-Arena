//lib/endpoints.ts
import { MODELS } from "@/lib/models";

// ============================================================
// SERVER CONFIG
// ============================================================

export const SERVER_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_PROXY_URL ?? "http://localhost:8000",
  apiPath: "/v1/chat/completions",
} as const;

// ============================================================
// MODEL-SPECIFIC OVERRIDES
// ============================================================

export const MODEL_EXTRA: Record<string, Record<string, unknown>> = {
  "kimi-2.5": {
    chat_template_kwargs: { thinking: true },
    max_tokens: 16384,
    temperature: 1.0,
    top_p: 1.0,
  },
  "kimi-k2": {
    max_tokens: 16384,
  },
};

// ============================================================
// RESOLVE ENDPOINT
// ============================================================

export interface ResolvedEndpoint {
  fullUrl: string;
  modelName: string;
  active: boolean;
  extra: Record<string, unknown>;
  base: string;
}

/**
 * Resolves the full endpoint details for a given model.
 *
 * Priority:
 *  1. UI overrides (passed explicitly — from Zustand modelEndpoints)
 *  2. MODEL_EXTRA (model-specific param overrides in this file)
 *  3. MODELS array (fullName)
 *  4. Fallback (modelId as-is)
 */
export function resolveModelEndpoint(
  modelId: string,
  overrides: Record<string, string> = {}
): ResolvedEndpoint {
  const model = MODELS.find((m) => m.id === modelId);
  const base = SERVER_CONFIG.baseUrl;
  const fullUrl = base + SERVER_CONFIG.apiPath;

  // User-configured endpoint override for this model
  const customUrl = overrides[modelId];

  return {
    fullUrl: customUrl ?? fullUrl,
    modelName: model?.fullName ?? modelId,
    active: model?.active ?? false,
    extra: MODEL_EXTRA[modelId] ?? {},
    base,
  };
}