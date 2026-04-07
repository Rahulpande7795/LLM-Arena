// lib/tools.ts

// ─── Weather API ───────────────────────────────────────────────
async function fetchWeather(city: string, unit: string): Promise<unknown> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY 
                 ?? process.env.WEATHER_API_KEY;

  // Step 1: Geocode city to lat/lon
  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
  );
  if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.status}`);
  const geoData = await geoRes.json();
  if (!geoData || geoData.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const { lat, lon } = geoData[0];

  // Step 2: Fetch weather
  const units = unit === "fahrenheit" ? "imperial" : "metric";
  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
  );
  if (!weatherRes.ok) throw new Error(`Weather fetch failed: ${weatherRes.status}`);
  const data = await weatherRes.json();

  return {
    city:        data.name,
    temperature: Math.round(data.main.temp),
    unit,
    condition:   data.weather[0].main,
    description: data.weather[0].description,
    humidity:    data.main.humidity,
    wind_speed:  data.wind.speed,
    source:      "OpenWeatherMap",
    timestamp:   Date.now(),
  };
}

// ─── Exchange Rate API ─────────────────────────────────────────
async function fetchExchangeRate(from: string, to: string): Promise<unknown> {
  const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_API_KEY 
                 ?? process.env.EXCHANGE_API_KEY;

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from.toUpperCase()}`
  );
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);
  const data = await res.json();

  if (data.result !== "success") {
    throw new Error(`Exchange rate API error: ${data["error-type"]}`);
  }

  const rate = data.conversion_rates[to.toUpperCase()];
  if (!rate) throw new Error(`Currency not found: ${to}`);

  return {
    from:      from.toUpperCase(),
    to:        to.toUpperCase(),
    rate:      rate,
    base_code: data.base_code,
    source:    "ExchangeRate-API",
    timestamp: Date.now(),
  };
}

// ─── Metal Price API ───────────────────────────────────────────
async function fetchCommodityPrice(
  commodity: string, 
  currency: string
): Promise<unknown> {
  const apiKey = process.env.NEXT_PUBLIC_METAL_API_KEY 
                 ?? process.env.METAL_API_KEY;

  // Map commodity name to symbol
  const symbolMap: Record<string, string> = {
    gold:      "XAU",
    silver:    "XAG",
    platinum:  "XPT",
    palladium: "XPD",
  };
  const symbol = symbolMap[commodity.toLowerCase()];
  if (!symbol) throw new Error(`Unknown commodity: ${commodity}`);

  const res = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=${symbol}`
  );
  if (!res.ok) throw new Error(`Metal price fetch failed: ${res.status}`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(`MetalPriceAPI error: ${data.error?.info ?? "Unknown"}`);
  }

  // API returns units of metal per 1 USD
  // Invert to get USD per troy oz
  const ratePerUsd = data.rates[symbol];
  const priceUsd   = 1 / ratePerUsd;

  // Convert to target currency if not USD
  let finalPrice = priceUsd;
  if (currency.toUpperCase() !== "USD") {
    const fxRes = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_API_KEY ?? process.env.EXCHANGE_API_KEY}/latest/USD`
    );
    const fxData = await fxRes.json();
    finalPrice = priceUsd * (fxData.conversion_rates[currency.toUpperCase()] ?? 1);
  }

  return {
    commodity: commodity.toLowerCase(),
    currency:  currency.toUpperCase(),
    price:     parseFloat(finalPrice.toFixed(2)),
    unit:      "troy oz",
    symbol,
    source:    "MetalPriceAPI",
    timestamp: Date.now(),
  };
}

// ─── TOOL DEFINITIONS (OpenAI format) ─────────────────────────
export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name:        "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: {
            type:        "string",
            description: "City name e.g. London, Mumbai, New York",
          },
          unit: {
            type:        "string",
            enum:        ["celsius", "fahrenheit"],
            description: "Temperature unit",
          },
        },
        required: ["city", "unit"],
      },
    },
  },
  {
    type: "function",
    function: {
      name:        "get_exchange_rate",
      description: "Get real-time exchange rate between two currencies",
      parameters: {
        type: "object",
        properties: {
          from: {
            type:        "string",
            description: "Source currency code e.g. USD, INR, EUR",
          },
          to: {
            type:        "string",
            description: "Target currency code e.g. INR, EUR, GBP",
          },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name:        "get_commodity_price",
      description: "Get current price of gold, silver, platinum or palladium",
      parameters: {
        type: "object",
        properties: {
          commodity: {
            type:        "string",
            enum:        ["gold", "silver", "platinum", "palladium"],
            description: "The metal to get the price for",
          },
          currency: {
            type:        "string",
            description: "Currency for the price e.g. USD, INR, EUR",
          },
        },
        required: ["commodity", "currency"],
      },
    },
  },
];

// ─── MAIN EXECUTOR ─────────────────────────────────────────────
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  try {
    switch (toolName) {
      case "get_weather":
        return await fetchWeather(
          String(args.city ?? ""),
          String(args.unit ?? "celsius")
        );

      case "get_exchange_rate":
        return await fetchExchangeRate(
          String(args.from ?? "USD"),
          String(args.to  ?? "INR")
        );

      case "get_commodity_price":
        return await fetchCommodityPrice(
          String(args.commodity ?? "gold"),
          String(args.currency  ?? "USD")
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (err) {
    // Return structured error — do NOT swallow it
    return {
      error:     true,
      message:   err instanceof Error ? err.message : "Tool execution failed",
      toolName,
      timestamp: Date.now(),
    };
  }
}