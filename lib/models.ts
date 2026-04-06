//lib/models.ts
import type { ModelConfig } from "@/types";

export const MODELS: ModelConfig[] = [
  {
    id: "mistral-24b",
    label: "Mistral 24B",
    fullName: "mistralai/mistral-7b-instruct-v0.2",
    color: "#8b5cf6",
    sizeLabel: "24B",
    active: true,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#8b5cf6" opacity="0.85"/></svg>`,
  },
  {
    id: "llama-8b",
    label: "Llama 8B",
    fullName: "nvidia/llama-3.1-nemotron-safety-guard-8b-v3",
    color: "#f97316",
    sizeLabel: "8B",
    active: true,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#f97316" opacity="0.85"/><circle cx="12" cy="12" r="5" fill="#f97316"/></svg>`,
  },
  {
    id: "qwen-24b",
    label: "Qwen 72B",
    fullName: "qwen/qwq-32b",
    color: "#ec4899",
    sizeLabel: "72B",
    active: true,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ec4899" opacity="0.85"/></svg>`,
  },
  {
    id: "kimi-k2",
    label: "Kimi K2",
    fullName: "moonshotai/kimi-k2-instruct",
    color: "#a78bfa",
    sizeLabel: "K2",
    active: true,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,20 2,20" fill="#a78bfa" opacity="0.85"/></svg>`,
  },
  {
    id: "gpt-oss-20b",
    label: "GPT OSS 20B",
    fullName: "openai/gpt-oss-20b",
    color: "#06b6d4",
    sizeLabel: "20B",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#06b6d4" stroke-width="2.5"/><circle cx="12" cy="12" r="4" fill="#06b6d4"/></svg>`,
  },
  {
    id: "sarvam-m",
    label: "Sarvam M",
    fullName: "sarvamai/sarvam-m",
    color: "#f59e0b",
    sizeLabel: "M",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="#f59e0b" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#f59e0b"/></svg>`,
  },
  {
    id: "qwen-500m",
    label: "Qwen 0.5B",
    fullName: "qwen/qwen2.5-0.5b-instruct",
    color: "#14b8a6",
    sizeLabel: "0.5B",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="2" fill="#14b8a6" opacity="0.85"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#14b8a6" opacity="0.5"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#14b8a6" opacity="0.5"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#14b8a6" opacity="0.85"/></svg>`,
  },
  {
    id: "kimi-2.5",
    label: "Kimi 2.5",
    fullName: "moonshotai/kimi-k2.5",
    color: "#6366f1",
    sizeLabel: "K2.5",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,20 2,20" fill="none" stroke="#6366f1" stroke-width="2"/><polygon points="12,6 18,18 6,18" fill="#6366f1" opacity="0.7"/></svg>`,
  },
  {
    id: "gemma-9b",
    label: "Gemma 9B",
    fullName: "google/gemma-3-9b-it",
    color: "#4ade80",
    sizeLabel: "9B",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4ade80" opacity="0.2" stroke="#4ade80" stroke-width="2"/><path d="M8 12 L12 8 L16 12 L12 16 Z" fill="#4ade80"/></svg>`,
  },
  {
    id: "mistral-7b",
    label: "Mistral 7B",
    fullName: "mistralai/mistral-7b-instruct-v0.3",
    color: "#fb923c",
    sizeLabel: "7B",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#fb923c" opacity="0.4" stroke="#fb923c" stroke-width="1.5"/><polygon points="12,6 18,9 18,15 12,18 6,15 6,9" fill="#fb923c"/></svg>`,
  },
  {
    id: "qwen-7b",
    label: "Qwen 7B",
    fullName: "qwen/qwen2.5-7b-instruct",
    color: "#38bdf8",
    sizeLabel: "7B",
    active: false,
    logoSvg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#38bdf8" stroke-width="2"/><rect x="8" y="8" width="8" height="8" rx="2" fill="#38bdf8"/></svg>`,
  },
];

/** Quick lookup by model id */
export function getModel(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

/** Returns only the 4 default active models */
export const DEFAULT_ACTIVE_MODELS = MODELS.filter((m) => m.active).map(
  (m) => m.id
);