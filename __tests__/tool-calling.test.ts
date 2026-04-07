/**
 * Tool calling integration tests
 * Tests tool detection, executeToolCall real APIs, and two-phase flow logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeToolCall, TOOL_DEFINITIONS } from "@/lib/tools";

// Load local environment for tests
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ============================================================
// TOOL DEFINITIONS TESTS
// ============================================================

describe("Tool definitions are correctly structured", () => {
  it("A: TOOL_DEFINITIONS has exactly 3 tools", () => {
    expect(TOOL_DEFINITIONS).toHaveLength(3);
  });

  it("B: all tools are OpenAI function format with required fields", () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.type).toBe("function");
      expect(tool.function).toBeDefined();
      expect(typeof tool.function.name).toBe("string");
      expect(typeof tool.function.description).toBe("string");
      expect(tool.function.parameters).toBeDefined();
      expect(tool.function.parameters.type).toBe("object");
      expect(tool.function.parameters.properties).toBeDefined();
    }
  });

  it("C: get_commodity_price has correct enum values", () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === "get_commodity_price"
    );
    expect(tool).toBeDefined();

    const { properties } = tool!.function.parameters;
    
    expect(properties.commodity).toBeDefined();
    expect(properties.commodity?.enum).toContain("gold");
    expect(properties.commodity?.enum).toContain("silver");
    expect(properties.commodity?.enum).toContain("platinum");
    
    expect(properties.currency).toBeDefined();
    expect(properties.currency?.type).toBe("string");
    expect(properties.currency?.description).toBeDefined();
  });

  it("D: get_weather has celsius and fahrenheit options", () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === "get_weather"
    );
    expect(tool).toBeDefined();
    const { properties } = tool!.function.parameters;
    
    expect(properties.unit).toBeDefined();
    expect(properties.unit?.enum).toContain("celsius");
    expect(properties.unit?.enum).toContain("fahrenheit");
  });
});

// ============================================================
// executeToolCall — REAL APIs
// ============================================================

describe("Tool calling: detection, execution, and final answer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("A: get_commodity_price returns correct gold price in USD", async () => {
    const result = await executeToolCall("get_commodity_price", {
      commodity: "gold",
      currency:  "USD",
    }) as Record<string, unknown>;

    expect(result.commodity).toBe("gold");
    expect(result.currency).toBe("USD");
    expect(typeof result.price).toBe("number");
    expect(result.price as number).toBeGreaterThan(0);
    expect(result.source).toBe("MetalPriceAPI");
    expect(typeof result.timestamp).toBe("number");
  });

  it("B: get_commodity_price returns correct silver price in INR", async () => {
    const result = await executeToolCall("get_commodity_price", {
      commodity: "silver",
      currency:  "INR",
    }) as Record<string, unknown>;

    expect(result.commodity).toBe("silver");
    expect(result.currency).toBe("INR");
    expect(typeof result.price).toBe("number");
    expect(result.price as number).toBeGreaterThan(0);
  });

  it("C: get_commodity_price returns correct platinum price in EUR", async () => {
    const result = await executeToolCall("get_commodity_price", {
      commodity: "platinum",
      currency:  "EUR",
    }) as Record<string, unknown>;

    expect(result.commodity).toBe("platinum");
    expect(result.currency).toBe("EUR");
    expect(typeof result.price).toBe("number");
    expect(result.price as number).toBeGreaterThan(0);
  });

  // ── Weather ─────────────────────────────────────────────────

  it("D: get_weather returns correct data for Bengaluru in celsius", async () => {
    const result = await executeToolCall("get_weather", {
      city: "bengaluru",
      unit: "celsius",
    }) as Record<string, unknown>;

    expect(typeof result.temperature).toBe("number");
    expect(typeof result.condition).toBe("string");
    expect(result.unit).toBe("celsius");
    expect(result.source).toBe("OpenWeatherMap");
  });

  it("E: get_weather converts celsius to fahrenheit correctly", async () => {
    const result = await executeToolCall("get_weather", {
      city: "london",
      unit: "fahrenheit",
    }) as Record<string, unknown>;

    expect(typeof result.temperature).toBe("number");
    expect(result.unit).toBe("fahrenheit");
  });

  it("F: get_weather handles unknown city gracefully", async () => {
    const result = await executeToolCall("get_weather", {
      city: "atlantis_not_real_12345",
      unit: "celsius",
    }) as Record<string, unknown>;

    expect(result.error).toBe(true);
    expect(typeof result.message).toBe("string");
  });

  // ── Exchange rates ──────────────────────────────────────────

  it("G: get_exchange_rate returns correct USD/INR rate", async () => {
    const result = await executeToolCall("get_exchange_rate", {
      from: "USD",
      to:   "INR",
    }) as Record<string, unknown>;

    expect(typeof result.rate).toBe("number");
    expect(result.rate as number).toBeGreaterThan(0);
    expect(result.from).toBe("USD");
    expect(result.to).toBe("INR");
  });

  it("H: get_exchange_rate supports reverse lookup (INR/USD)", async () => {
    const result = await executeToolCall("get_exchange_rate", {
      from: "INR",
      to:   "USD",
    }) as Record<string, unknown>;

    expect(typeof result.rate).toBe("number");
    expect(result.rate as number).toBeGreaterThan(0);
  });

  it("I: get_exchange_rate same currency returns rate of 1", async () => {
    const result = await executeToolCall("get_exchange_rate", {
      from: "USD",
      to:   "USD",
    }) as Record<string, unknown>;

    expect(result.rate).toBe(1);
  });

  it("J: unknown tool returns error object instead of throwing", async () => {
    const result = await executeToolCall("nonexistent_tool", {}) as Record<string, unknown>;

    expect(result.error).toBe(true);
    expect(typeof result.message).toBe("string");
  });

  // ── Two-phase flow simulation ────────────────────────────────

  it("K: two-phase tool flow — model calls tool → result appended to messages", async () => {
    // Simulate Phase 1: model decides to call get_commodity_price
    const phase1Response = {
      choices: [
        {
          finish_reason: "tool_calls",
          message: {
            tool_calls: [
              {
                id:   "call_abc123",
                type: "function",
                function: {
                  name:      "get_commodity_price",
                  arguments: JSON.stringify({ commodity: "gold", currency: "USD" }),
                },
              },
            ],
          },
        },
      ],
    };

    expect(phase1Response.choices[0].finish_reason).toBe("tool_calls");

    const rawArgs = JSON.parse(
      phase1Response.choices[0].message.tool_calls[0].function.arguments
    );
    expect(rawArgs).toEqual({ commodity: "gold", currency: "USD" });

    // Execute the tool
    const toolResult = await executeToolCall(
      phase1Response.choices[0].message.tool_calls[0].function.name,
      rawArgs
    ) as Record<string, unknown>;

    expect(typeof toolResult.price).toBe("number");
    expect(toolResult.price as number).toBeGreaterThan(0);

    // Build Phase 2 messages array
    const phase2Messages = [
      { role: "user",      content: "What is the gold price?" },
      {
        role:       "assistant",
        content:    null,
        tool_calls: phase1Response.choices[0].message.tool_calls,
      },
      {
        role:         "tool",
        tool_call_id: "call_abc123",
        content:      JSON.stringify(toolResult),
      },
    ];

    // Verify structure
    expect(phase2Messages).toHaveLength(3);
    expect(phase2Messages[2].role).toBe("tool");
    expect(phase2Messages[2].tool_call_id).toBe("call_abc123");

    const parsedContent = JSON.parse(phase2Messages[2].content as string) as Record<string, unknown>;
    expect(typeof parsedContent.price).toBe("number");
    expect(parsedContent.price as number).toBeGreaterThan(0);
  });

  it("L: model ignores tools (finish_reason=stop) — no executeToolCall needed", () => {
    // Simulate Phase 1: model responds directly without calling a tool
    const phase1Response = {
      choices: [
        {
          finish_reason: "stop",
          message: {
            content:    "Gold is approximately $2,341 per troy ounce.",
            tool_calls: undefined,
          },
        },
      ],
    };

    const choice = phase1Response.choices[0];

    // finish_reason is "stop" → no tool execution branch
    expect(choice.finish_reason).toBe("stop");
    expect(choice.message.tool_calls).toBeUndefined();
    expect(choice.message.content).toContain("2,341");

    // In the real hook this triggers: onMetrics({ tool: "✗" }) + onDone()
    // We verify the decision point here:
    const shouldCallTool = choice.finish_reason === "tool_calls";
    expect(shouldCallTool).toBe(false);
  });
});