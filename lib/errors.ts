import { ErrorType } from "@/types";
import type { ClassifiedError } from "@/types";

/**
 * Classifies any thrown error into a typed ClassifiedError.
 * Returns null for AbortErrors (cancelled — not an error state).
 */
export function classifyError(err: unknown): ClassifiedError | null {
  // ── Abort / cancellation — not an error ──────────────────
  if (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.name === "TimeoutError" && err.message.includes("abort"))
  ) {
    return null;
  }

  if (err instanceof Error && err.name === "AbortError") {
    return null;
  }

  // ── Timeout ───────────────────────────────────────────────
  if (err instanceof Error && err.name === "TimeoutError") {
    return {
      type: ErrorType.TIMEOUT,
      message: "Request timed out. The model may be overloaded.",
      retryable: true,
    };
  }

  // ── Network / fetch error ─────────────────────────────────
  if (
    err instanceof TypeError &&
    (err.message.includes("fetch") ||
      err.message.includes("network") ||
      err.message.includes("Failed to fetch"))
  ) {
    return {
      type: ErrorType.NETWORK,
      message: "Network error — check your connection and proxy server.",
      retryable: true,
    };
  }

  // ── HTTP status errors (custom error objects with .status) ─
  const status = (err as { status?: number })?.status;

  if (status === 401 || status === 403) {
    return {
      type: ErrorType.AUTH,
      message: "Authentication failed — check your API key.",
      retryable: false,
    };
  }

  if (status === 429) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: "Rate limit hit — wait a moment before retrying.",
      retryable: true,
    };
  }

  if (status === 404) {
    return {
      type: ErrorType.MODEL_OFFLINE,
      message: "Model not found or offline.",
      retryable: false,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      type: ErrorType.UNKNOWN,
      message: `Server error (${status}) — the inference API may be down.`,
      retryable: true,
    };
  }

  // ── Parse error ───────────────────────────────────────────
  if (err instanceof SyntaxError) {
    return {
      type: ErrorType.PARSE_ERROR,
      message: "Failed to parse the model response.",
      retryable: false,
    };
  }

  // ── Unknown fallback ──────────────────────────────────────
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";

  return {
    type: ErrorType.UNKNOWN,
    message,
    retryable: false,
  };
}

/** Creates a fetch-response-like error with a status code attached */
export function createHttpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}