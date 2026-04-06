# LLM Arena — Proxy Server

A minimal Express.js proxy that pipes requests from the Next.js frontend
to the NVIDIA Inference API. Handles both streaming (SSE) and non-streaming responses.

## Why a proxy?

The NVIDIA API requires a server-side API key and does not send CORS headers
that allow direct browser requests. This server sits between the two.

---

## Setup

```bash
# 1. Enter the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Edit .env — add your NVIDIA API key
#    Key format: nvapi-xxxxxxxxxxxxxxxxxxxxxxxx
#    Get one at: https://build.nvidia.com

# 5. Start the server
node index.js
```

---

## Running in watch mode (auto-restart on file change)

```bash
node --watch index.js
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check — returns uptime + key status |
| `POST` | `/*` | Proxy all POST requests to NVIDIA API |

### Health check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": 1700000000000,
  "key_set": true
}
```

### Test a non-streaming inference call
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama-3.1-8b-instruct",
    "messages": [{"role": "user", "content": "Say hello"}],
    "stream": false,
    "max_tokens": 50
  }'
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | ✅ Yes | Your NVIDIA Inference API key (starts with `nvapi-`) |
| `PORT` | No | Server port (default: `8000`) |

---

## Architecture

```
Browser (Next.js)
      │
      │ POST /v1/chat/completions
      ▼
 Express Proxy (port 8000)
      │
      │ HTTPS + Authorization: Bearer {key}
      ▼
 integrate.api.nvidia.com:443
      │
      │ SSE stream  ──────────────────► piped back to browser
      │ JSON response ────────────────► piped back to browser
```