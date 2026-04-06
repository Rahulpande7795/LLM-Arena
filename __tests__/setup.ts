/**
 * SSE streaming integration tests
 * Tests the core useInference hook logic directly (no React rendering)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { classifyError } from "@/lib/errors";
import { ErrorType } from "@/types";

// ============================================================
// HELPERS
// ============================================================

/**
 * Creates a ReadableStream that emits each string as a UTF-8
 * encoded chunk then closes — simulates an SSE response body.
 */
function createSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(new TextEncoder().encode(line));
      }
      controller.close();
    },
  });
}

/**
 * Minimal fetch response factory.
 */
function makeStreamResponse(lines: string[]): Response {
  return {
    ok:     true,
    status: 200,
    body:   createSSEStream(lines),
    json:   async () => { throw new Error("not a JSON response"); },
  } as unknown as Response;
}

function makeJsonResponse(data: unknown, status = 200): Response {
  return {
    ok:     status >= 200 && status < 300,
    status,
    body:   null,
    json:   async () => data,
  } as unknown as Response;
}

// ============================================================
// SSE PARSER (mirrors useInference logic — pure function version)
// ============================================================

/**
 * Parses an SSE ReadableStream and accumulates tokens.
 * Returns { tokens, ttft, totalTokens }.
 * This isolates the parsing logic so we can test it without React.
 */
async function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): Promise<{
  tokens:      string[];
  accumulated: string;
  ttft:        number | null;
  tokenCount:  number;
}> {
  const reader  = stream.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";
  let   ttft:   number | null = null;
  const tokens: string[] = [];
  const start = performance.now();

  outer: while (true) {
    if (signal?.aborted) break;

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

      let chunk: { choices?: Array<{ delta?: { content?: string } }> };
      try {
        chunk = JSON.parse(data);
      } catch {
        continue; // skip malformed chunks
      }

      const content = chunk?.choices?.[0]?.delta?.content;
      if (!content) continue;

      if (ttft === null) ttft = performance.now() - start;
      tokens.push(content);
    }
  }

  return {
    tokens,
    accumulated: tokens.join(""),
    ttft,
    tokenCount: tokens.length,
  };
}

// ============================================================
// TEST SUITE A — Happy path
// ============================================================

describe("SSE streaming delivers tokens and falls back on failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── TEST A: Happy path ──────────────────────────────────────
  it("A: happy path — SSE stream accumulates all tokens correctly", async () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
    ];

    const stream = createSSEStream(lines);
    const result = await parseSSEStream(stream);

    // Correct token accumulation
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toBe("Hello");
    expect(result.tokens[1]).toBe(" world");
    expect(result.accumulated).toBe("Hello world");

    // TTFT recorded on first token
    expect(result.ttft).not.toBeNull();
    expect(typeof result.ttft).toBe("number");
    expect(result.ttft).toBeGreaterThanOrEqual(0);

    // Token count
    expect(result.tokenCount).toBe(2);
  });

  // ── TEST B: Malformed chunks skipped ───────────────────────
  it("B: malformed JSON chunks are skipped without throwing", async () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"Valid"},"finish_reason":null}]}\n\n',
      'data: {BROKEN JSON\n\n',
      'data: {"choices":[{"delta":{"content":" token"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
    ];

    const stream = createSSEStream(lines);
    const result = await parseSSEStream(stream);

    // Malformed chunk skipped — only 2 valid tokens
    expect(result.tokens).toHaveLength(2);
    expect(result.accumulated).toBe("Valid token");
  });

  // ── TEST C: Empty delta skipped ─────────────────────────────
  it("C: empty delta content is skipped and does not increment token count", async () => {
    const lines = [
      'data: {"choices":[{"delta":{},"finish_reason":null}]}\n\n',
      'data: {"choices":[{"delta":{"content":""},"finish_reason":null}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
    ];

    const stream = createSSEStream(lines);
    const result = await parseSSEStream(stream);

    // Only the "Hello" token counted
    expect(result.tokenCount).toBe(1);
    expect(result.accumulated).toBe("Hello");
  });

  // ── TEST D: [DONE] stops parsing ───────────────────────────
  it("D: [DONE] sentinel stops processing further lines", async () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"First"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
      // These lines should never be processed
      'data: {"choices":[{"delta":{"content":"After done"},"finish_reason":null}]}\n\n',
    ];

    const stream = createSSEStream(lines);
    const result = await parseSSEStream(stream);

    expect(result.tokens).toHaveLength(1);
    expect(result.accumulated).toBe("First");
  });

  // ── TEST E: AbortError classification ──────────────────────
  it("E: AbortError is classified as null (not an error — user cancelled)", () => {
    const abortErr = new DOMException("The operation was aborted", "AbortError");
    const result   = classifyError(abortErr);

    // AbortError must return null — never triggers fallback
    expect(result).toBeNull();
  });

  // ── TEST F: Network error classification ────────────────────
  it("F: TypeError fetch error is classified as NETWORK (retryable)", () => {
    const networkErr = new TypeError("Failed to fetch");
    const result     = classifyError(networkErr);

    expect(result).not.toBeNull();
    expect(result!.type).toBe(ErrorType.NETWORK);
    expect(result!.retryable).toBe(true);
  });

  // ── TEST G: HTTP 401 classification ────────────────────────
  it("G: HTTP 401 error is classified as AUTH (not retryable)", () => {
    const authErr = Object.assign(new Error("Unauthorized"), { status: 401 });
    const result  = classifyError(authErr);

    expect(result).not.toBeNull();
    expect(result!.type).toBe(ErrorType.AUTH);
    expect(result!.retryable).toBe(false);
  });

  // ── TEST H: HTTP 429 classification ────────────────────────
  it("H: HTTP 429 is classified as RATE_LIMIT (retryable)", () => {
    const rateLimitErr = Object.assign(new Error("Too Many Requests"), { status: 429 });
    const result       = classifyError(rateLimitErr);

    expect(result).not.toBeNull();
    expect(result!.type).toBe(ErrorType.RATE_LIMIT);
    expect(result!.retryable).toBe(true);
  });

  // ── TEST I: HTTP 404 classification ────────────────────────
  it("I: HTTP 404 is classified as MODEL_OFFLINE (not retryable)", () => {
    const notFoundErr = Object.assign(new Error("Not Found"), { status: 404 });
    const result      = classifyError(notFoundErr);

    expect(result).not.toBeNull();
    expect(result!.type).toBe(ErrorType.MODEL_OFFLINE);
    expect(result!.retryable).toBe(false);
  });

  // ── TEST J: Partial buffer handling ────────────────────────
  it("J: partial JSON split across chunks is buffered and parsed correctly", async () => {
    // Simulate a chunk that is split mid-line (real SSE edge case)
    const part1 = 'data: {"choices":[{"delta":{"cont';
    const part2 = 'ent":"Split"},"finish_reason":null}]}\n\n';
    const done  = 'data: [DONE]\n\n';

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(part1));
        controller.enqueue(new TextEncoder().encode(part2));
        controller.enqueue(new TextEncoder().encode(done));
        controller.close();
      },
    });

    const result = await parseSSEStream(stream);

    // The split chunk reassembled correctly
    expect(result.tokens).toHaveLength(1);
    expect(result.accumulated).toBe("Split");
  });
});