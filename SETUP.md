# LLM Arena — Setup Guide

Complete setup instructions for running LLM Arena locally.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 18 | LTS recommended |
| npm | ≥ 9 | Comes with Node |
| NVIDIA API Key | — | [Get one free](https://build.nvidia.com/) |

---

## Step 1 — Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend proxy dependencies
cd server
npm install
cd ..
```

---

## Step 2 — Configure Environment

### Backend (`server/.env`)

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

```env
NVIDIA_API_KEY=nvapi-your-actual-key-here
PORT=8000
```

> **Get an API key:** Go to [build.nvidia.com](https://build.nvidia.com/), sign up for free, and copy your key from the API Keys section. The free tier includes generous token credits.

### Frontend (`llm-arena/.env.local`)

This file is already set up correctly:

```env
NEXT_PUBLIC_PROXY_URL=http://localhost:8000
```

Only change this if you're running the proxy on a different port or host.

---

## Step 3 — Start the Backend Proxy

Open a **new terminal** and run:

```bash
cd server
node index.js
```

You should see:

```
🚀 LLM Arena proxy running on http://localhost:8000
```

The proxy forwards requests from the browser to the NVIDIA API and handles CORS, streaming, and authentication.

---

## Step 4 — Start the Frontend

In a **separate terminal**:

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.x
- Local: http://localhost:3000
✓ Ready in ~5s
```

---

## Step 5 — Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)**

- **Landing page**: `http://localhost:3000`
- **Arena**: `http://localhost:3000/arena`

---

## Verifying the Setup

1. Open the Arena (`/arena`)
2. Check the connection status dot in the top-right — it should turn **green**
3. Select 2–4 models from the chip bar
4. Type a prompt and press `Ctrl+Enter`
5. You should see streaming responses appear within a few seconds

If the status dot stays red, check that:
- `server/index.js` is running on port 8000
- `server/.env` contains a valid `NVIDIA_API_KEY`
- No firewall is blocking `localhost:8000`

---

## Running Tests

```bash
# Run all 46 tests
npm test

# Run once (no watch)
npx vitest run

# TypeScript check
npx tsc --noEmit

# Lint check
npx next lint
```

---

## Production Build

```bash
npm run build
npm start
```

> **Note:** Always delete the `.next` folder before switching between `npm run build` and `npm run dev` on Windows to avoid EINVAL errors from symlinks:
> ```powershell
> Remove-Item -Recurse -Force .next
> npm run dev
> ```

---

## Tool Calling Setup

Tool calling is enabled via the toggle in the PromptBar. When active:

1. Phase 1: Model is called with `stream: false` + tool definitions
2. If the model calls a tool, the mock tool executes and returns a result
3. Phase 2: Model is called again with the tool output to generate a final answer

Available tools:
- `get_commodity_price` — Returns mock commodity prices (gold, silver, oil, etc.)

---

## Customizing Models

Edit `lib/models.ts` to add, remove, or reorder models. Each model needs:

```typescript
{
  id:       "my-model",          // unique slug
  label:    "My Model",          // display name
  fullName: "provider/model-id", // NVIDIA API model name
  color:    "var(--accent)",     // CSS token color
  active:   false,               // default selection
}
```

---

## Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | `server/.env` | Your NVIDIA API key |
| `PORT` | `server/.env` | Proxy port (default: 8000) |
| `NEXT_PUBLIC_PROXY_URL` | `.env.local` | Frontend → proxy URL |

---

## Troubleshooting

### `EINVAL: invalid argument, readlink .next/...`
Windows-specific issue after running `npm run build`. Fix:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Status dot stays red
- Confirm `server/index.js` is running: `node server/index.js`
- Check `server/.env` has a valid key
- Try the Settings page → Ping Server button

### Models return errors
- Verify your NVIDIA API key has credits
- Some free-tier models may be unavailable — try a different model
- Check the browser DevTools Network tab for HTTP error codes

### Blank screen after navigation
- Hard refresh (`Ctrl+Shift+R`)
- Clear localStorage: DevTools → Application → Storage → Clear All
