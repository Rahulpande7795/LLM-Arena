// ============================================================
// LLM Arena — Backend Proxy Server (FIXED)
// ============================================================

/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const { Readable } = require("stream");

const app = express();

// ================= CORS =================
app.use(cors({
  origin:  "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.options("*", cors());

// ================= DEBUG LOGGER =================
app.use((req, _res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ================= HEALTH =================
app.get("/health", (_req, res) => {
  res.json({
    status:    "ok",
    uptime:    process.uptime(),
    timestamp: Date.now(),
  });
});

// ================= MAIN PROXY =================
app.post("/v1/chat/completions", async (req, res) => {
  try {
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

    const apiKey  = process.env.NVIDIA_API_KEY;
    const baseUrl = process.env.NVIDIA_BASE_URL 
      ?? "https://integrate.api.nvidia.com/v1";

    if (!apiKey) {
      throw new Error("Missing NVIDIA_API_KEY in .env");
    }

    const upstreamRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    console.log("📡 Status:", upstreamRes.status);
    console.log("📡 Content-Type:", upstreamRes.headers.get("content-type"));

    // Forward status
    res.status(upstreamRes.status);

    // Forward headers (safe)
    upstreamRes.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding"].includes(key)) {
        res.setHeader(key, value);
      }
    });

    // ================= STREAM HANDLING =================
    const isStream = req.body.stream === true;

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      if (upstreamRes.body) {
        console.log("🚀 Streaming response...");
        Readable.fromWeb(upstreamRes.body).pipe(res);
      } else {
        console.warn("⚠️ No stream body received");
        res.end();
      }

      return; // IMPORTANT
    }

    // ================= NON-STREAM HANDLING =================
    const contentType = upstreamRes.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await upstreamRes.json();
      res.json(data);
    } else {
      const text = await upstreamRes.text();

      console.error("⚠️ Non-JSON response from upstream:");
      console.error(text.slice(0, 300));

      res.status(502).json({
        error: {
          message: "Invalid upstream response (not JSON)",
          preview: text.slice(0, 200),
        },
      });
    }

  } catch (err) {
    console.error("❌ Proxy error:", err.stack || err);

    res.status(502).json({ 
      error: { 
        message: `Proxy error: ${err.message}`,
        type: "proxy_error"
      } 
    });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT ?? 8000;

app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});