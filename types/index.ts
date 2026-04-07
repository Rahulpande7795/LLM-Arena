// ============================================================
// CORE ENUMS & UNION TYPES
// ============================================================

export type ThemeMode = "dark" | "light";

export type ViewMode = "compare" | "history" | "settings";

export type CardState =
  | "idle"
  | "loading"
  | "streaming"
  | "done"
  | "error"
  | "cancelled";

export type ExportFormat = "json" | "csv" | "markdown" | "text";

export enum ErrorType {
  NETWORK      = "NETWORK",
  TIMEOUT      = "TIMEOUT",
  AUTH         = "AUTH",
  RATE_LIMIT   = "RATE_LIMIT",
  MODEL_OFFLINE = "MODEL_OFFLINE",
  PARSE_ERROR  = "PARSE_ERROR",
  UNKNOWN      = "UNKNOWN",
}

// ============================================================
// MODEL
// ============================================================

export interface ModelConfig {
  id: string;
  label: string;
  fullName: string;
  color: string;
  sizeLabel: string;
  active: boolean;
  logoSvg?: string;
}

// ============================================================
// METRICS & RESULTS
// ============================================================

export interface MetricsData {
  ttft: number;       // time to first token (ms)
  tps: number;        // tokens per second
  tokens: number;     // total token count
  latency: number;    // total latency (ms)
  tool?: "✓" | "✗" | "—";
}

export interface RunResult {
  modelId: string;
  modelName: string;
  text: string;
  metrics: MetricsData;
  toolCall?: ToolCallResult | null;
  cancelled?: boolean;
  timestamp: number;
}

// ============================================================
// TOOL CALLING
// ============================================================

export interface ToolParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface ToolFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface ToolDefinition {
  type: "function";
  function: ToolFunction;
}

export interface ToolCallResult {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  status: "running" | "done" | "error";
  timestamp: number;
}

// ============================================================
// HISTORY
// ============================================================

export interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: number;
  models: string[];
  results: Record<string, RunResult>;
}

// ============================================================
// INFERENCE
// ============================================================

export interface InferenceParams {
  max_tokens: number;
  temperature: number;
  top_p: number;
}

export interface SSEChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
    index?: number;
  }>;
  id?: string;
  model?: string;
}

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  retryable: boolean;
}

// ============================================================
// STORE SHAPE
// ============================================================

export interface ArenaStore {
  // ── Persisted ──────────────────────────────────────────────
  baseUrl: string;
  apiKey: string;
  activeModels: string[];
  systemPrompt: string;
  showMetrics: boolean;
  autoScroll: boolean;
  modelEndpoints: Record<string, string>;
  theme: ThemeMode;
  toolMode: boolean;
  webglEnabled: boolean;

  // ── Session ────────────────────────────────────────────────
  history: HistoryEntry[];
  metricsLog: MetricsData[];
  runCount: number;
  totalTokens: number;
  ttftSamples: number[];
  lastResults: Record<string, RunResult>;
  cardStates: Record<string, CardState>;
  isRunning: boolean;
  activeToolCalls: Record<string, ToolCallResult>;

  // ── Actions ────────────────────────────────────────────────
  setTheme: (theme: ThemeMode) => void;
  toggleModel: (modelId: string) => void;
  setActiveModels: (models: string[]) => void;
  setSystemPrompt: (prompt: string) => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  setCardState: (modelId: string, state: CardState) => void;
  updateMetric: (modelId: string, metrics: Partial<MetricsData>) => void;
  setRunning: (running: boolean) => void;
  clearResults: () => void;
  setBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setModelEndpoint: (modelId: string, url: string) => void;
  toggleWebgl: () => void;
  toggleToolMode: () => void;
  setActiveToolCall: (modelId: string, tc: ToolCallResult) => void;
  clearToolCalls: () => void;
}

// ============================================================
// TEMPLATES
// ============================================================

export type TemplateCategory =
  | "code"
  | "reasoning"
  | "language"
  | "tool-calling";

export interface Template {
  id: string;
  label: string;
  category: TemplateCategory;
  prompt: string;
  useTools: boolean;
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

export type ShortcutKey =
  | "run"
  | "templates"
  | "export"
  | "clear"
  | "shortcuts"
  | "escape"
  | "theme"
  | "fullscreen";