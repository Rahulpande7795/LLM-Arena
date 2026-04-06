// ============================================================
// LLM Arena — Backend Proxy Server
// Thin SSE pipe between the Next.js frontend and NVIDIA API
// CommonJS (not ESM) — runs with plain `node index.js`
// ============================================================

require("dotenv").config();

const http  = require("http");
const https = require("https");
const express = require("express");

const app  = express();
const PORT = process.env.PORT || 8000;

// ── API Key ─────────────────────────────────────────────────
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";

if (!NVIDIA_API_KEY) {
  console.warn(
    "\x1b[33m[WARN]\x1b[0m NVIDIA_API_KEY is not set in .env"
  );
} else if (!NVIDIA_API_KEY.startsWith("nvapi-")) {
  console.warn(
    "\x1b[33m[WARN]\x1b[0m NVIDIA_API_KEY does not start with 'nvapi-' — double-check your key"
  );
} else {
  console.log(
    `\x1b[32m[OK]\x1b[0m  NVIDIA_API_KEY loaded (${NVIDIA_API_KEY.slice(0, 12)}...)`
  );
}

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "4mb" }));

// ── CORS ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ── Request logger ────────────────────────────────────────────
function log(req, body) {
  const stream = body && body.stream ? "stream=true" : "stream=false";
  const model  = (body && body.model) ? `model=${body.model}` : "";
  console.log(`[${req.method}] ${req.path}  ${stream}  ${model}`);
}

// ── Health check ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status:    "ok",
    uptime:    process.uptime(),
    timestamp: Date.now(),
    key_set:   !!NVIDIA_API_KEY,
  });
});

// ── Proxy catch-all ───────────────────────────────────────────
app.post("*", (req, res) => {
  const body    = req.body || {};
  const isStream = body.stream === true;
  log(req, body);

  // Target: https://integrate.api.nvidia.com/v1{req.path}
  const targetPath = req.path;

  const options = {
    hostname: "integrate.api.nvidia.com",
    port:     443,
    path:     targetPath,
    method:   "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    },
  };

  const bodyStr = JSON.stringify(body);

  // ── Streaming path ─────────────────────────────────────────
  if (isStream) {
    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Connection",        "keep-alive");

    const proxyReq = https.request(options, (proxyRes) => {
      // Forward non-200 as a single error SSE event
      if (proxyRes.statusCode !== 200) {
        console.error(`[PROXY ERROR] upstream returned ${proxyRes.statusCode}`);
        res.write(
          `data: ${JSON.stringify({ error: true, status: proxyRes.statusCode })}\n\n`
        );
        return res.end();
      }

      // Pipe SSE chunks directly to the client
      proxyRes.on("data", (chunk) => {
        res.write(chunk);
      });

      proxyRes.on("end", () => {
        res.end();
      });

      proxyRes.on("error", (err) => {
        console.error("[PROXY STREAM ERROR]", err.message);
        res.write(`data: ${JSON.stringify({ error: true, message: err.message })}\n\n`);
        res.end();
      });
    });

    proxyReq.on("error", (err) => {
      console.error("[PROXY REQ ERROR]", err.message);
      if (!res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: true, message: err.message })}\n\n`);
      }
      res.end();
    });

    proxyReq.write(bodyStr);
    proxyReq.end();

  // ── Non-streaming path ──────────────────────────────────────
  } else {
    const proxyReq = https.request(options, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 500;

      // Copy content-type from upstream
      if (proxyRes.headers["content-type"]) {
        res.setHeader("Content-Type", proxyRes.headers["content-type"]);
      }

      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("[PROXY NON-STREAM ERROR]", err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: true, message: err.message });
      }
    });

    proxyReq.write(bodyStr);
    proxyReq.end();
  }
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({ error: true, message: err.message || "Internal server error" });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\x1b[36m[LLM Arena Proxy]\x1b[0m running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
});