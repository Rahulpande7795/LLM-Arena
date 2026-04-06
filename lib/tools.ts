import type { ToolDefinition } from "@/types";

// ============================================================
// TOOL DEFINITIONS  (OpenAI function-calling format)
// ============================================================

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_commodity_price",
      description:
        "Returns the current spot price of a precious metal commodity in the requested currency.",
      parameters: {
        type: "object",
        properties: {
          commodity: {
            type: "string",
            description: "The commodity to look up.",
            enum: ["gold", "silver", "platinum"],
          },
          currency: {
            type: "string",
            description: "The currency for the returned price.",
            enum: ["USD", "INR", "EUR"],
          },
        },
        required: ["commodity", "currency"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "Returns the current weather conditions for a given city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name, e.g. 'Mumbai' or 'London'.",
          },
          unit: {
            type: "string",
            description: "Temperature unit.",
            enum: ["celsius", "fahrenheit"],
          },
        },
        required: ["city", "unit"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_exchange_rate",
      description:
        "Returns the current exchange rate between two currencies.",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Source currency code, e.g. 'USD'.",
          },
          to: {
            type: "string",
            description: "Target currency code, e.g. 'INR'.",
          },
        },
        required: ["from", "to"],
      },
    },
  },
];

// ============================================================
// MOCK DATA
// ============================================================

const COMMODITY_PRICES: Record<string, Record<string, number>> = {
  gold:     { USD: 2341.50, INR: 195200, EUR: 2158.40 },
  silver:   { USD: 29.82,   INR: 2487,   EUR: 27.51   },
  platinum: { USD: 981.00,  INR: 81900,  EUR: 905.00  },
};

const WEATHER_DATA: Record<
  string,
  { tempC: number; condition: string }
> = {
  bengaluru:   { tempC: 32, condition: "Sunny" },
  bangalore:   { tempC: 32, condition: "Sunny" },
  mumbai:      { tempC: 29, condition: "Cloudy" },
  delhi:       { tempC: 38, condition: "Hazy" },
  chennai:     { tempC: 34, condition: "Partly Cloudy" },
  hyderabad:   { tempC: 33, condition: "Sunny" },
  london:      { tempC: 14, condition: "Rainy" },
  "new york":  { tempC: 22, condition: "Clear" },
  tokyo:       { tempC: 26, condition: "Humid" },
  singapore:   { tempC: 30, condition: "Thunderstorms" },
};

const EXCHANGE_RATES: Record<string, number> = {
  "USD/INR": 83.4,
  "USD/EUR": 0.92,
  "USD/GBP": 0.79,
  "EUR/INR": 90.6,
  "GBP/INR": 105.2,
};

// ============================================================
// EXECUTOR
// ============================================================

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  await sleep(400); // simulate network latency

  switch (toolName) {
    case "get_commodity_price": {
      const commodity = String(args.commodity ?? "").toLowerCase();
      const currency = String(args.currency ?? "USD");
      const prices = COMMODITY_PRICES[commodity];
      if (!prices) {
        return { error: `Unknown commodity: ${commodity}`, source: "mock", timestamp: Date.now() };
      }
      const price = prices[currency] ?? prices["USD"];
      return {
        commodity,
        currency,
        price,
        unit: commodity === "gold" || commodity === "platinum" ? "troy oz" : "troy oz",
        source: "mock",
        timestamp: Date.now(),
      };
    }

    case "get_weather": {
      const city = String(args.city ?? "").toLowerCase();
      const unit = String(args.unit ?? "celsius");
      const data = WEATHER_DATA[city];
      if (!data) {
        return {
          city: args.city,
          temperature: null,
          condition: "Data not available",
          source: "mock",
          timestamp: Date.now(),
        };
      }
      const temp =
        unit === "fahrenheit"
          ? Math.round(data.tempC * 9 / 5 + 32)
          : data.tempC;
      return {
        city: args.city,
        temperature: temp,
        unit,
        condition: data.condition,
        source: "mock",
        timestamp: Date.now(),
      };
    }

    case "get_exchange_rate": {
      const from = String(args.from ?? "").toUpperCase();
      const to   = String(args.to   ?? "").toUpperCase();
      const key  = `${from}/${to}`;
      const reverseKey = `${to}/${from}`;

      let rate: number | null = null;
      if (EXCHANGE_RATES[key] !== undefined) {
        rate = EXCHANGE_RATES[key];
      } else if (EXCHANGE_RATES[reverseKey] !== undefined) {
        rate = Math.round((1 / EXCHANGE_RATES[reverseKey]) * 10000) / 10000;
      } else if (from === to) {
        rate = 1;
      }

      return {
        from,
        to,
        rate: rate ?? 1,
        available: rate !== null,
        source: "mock",
        timestamp: Date.now(),
      };
    }

    default:
      return {
        error: `Unknown tool: ${toolName}`,
        source: "mock",
        timestamp: Date.now(),
      };
  }
}