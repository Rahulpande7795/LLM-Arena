# ⚡ LLM Arena

> Fire the same prompt at 11 LLMs simultaneously. Watch them race. Pick the winner.

A self-hosted benchmarking tool that runs every model in parallel, streams responses in real time, and gives you hard metrics — TTFT, tokens/second, latency — so you actually know which model is fast vs. which one just feels fast.

---

## Demo

```
Prompt: "Explain transformers in 3 sentences"

Mistral 24B  ████████████████░░  done   142ms TTFT  87.3 t/s  214 tokens  ★1
Llama 8B     ████████████████████ done  98ms TTFT   94.1 t/s  198 tokens  ★2  ← fastest
Qwen 72B     ████████████░░░░░░░  done  201ms TTFT  71.2 t/s  287 tokens  ★3
Kimi K2      ████████████████░░░  done  183ms TTFT  68.9 t/s  341 tokens  ★4
```

---

## Features

- **11 models, 4 active by default** — toggle any combination with one click
- **Real-time SSE streaming** — all models stream simultaneously, not sequentially
- **Hard metrics per model** — TTFT, TPS, token count, total latency
- **Tool calling** — detects which models actually call tools vs. ignore them
- **Leaderboard** — auto-ranks by tokens/second after all models finish
- **Side-by-side compare** — pick any two models, diff their outputs word-by-word
- **Export** — JSON, CSV, Markdown, or plain text
- **13 prompt templates** — coding, reasoning, creative, summarization and more
- **Run history** — every run saved with full metrics
- **WebGL particle background** — Three.js, toggleable
- **Dark/light theme** — persistent, instant toggle
- **Keyboard-first** — Ctrl+Enter, Ctrl+K, Ctrl+E, Ctrl+/, T

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> llm-arena && cd llm-arena

# 2. Install
npm install && cd server && npm install && cd ..

# 3. Configure
echo "NEXT_PUBLIC_PROXY_URL=http://localhost:8000" > .env.local
echo "NVIDIA_API_KEY=nvapi-your-key" > server/.env

# 4. Run (two terminals)
cd server && node index.js          # Terminal 1 — proxy on :8000
npm run dev                         # Terminal 2 — Next.js on :3000
```

Get your free NVIDIA API key at **[build.nvidia.com](https://build.nvidia.com)**.

See [`SETUP.md`](./SETUP.md) for full setup, troubleshooting, and deployment.

---

## Models

| Model | ID | Size | Active |
|-------|----|------|--------|
| Mistral Small 24B | `mistral-24b` | 24B | ✅ |
| Llama 3.1 8B | `llama-8b` | 8B | ✅ |
| Qwen 2.5 72B | `qwen-24b` | 72B | ✅ |
| Kimi K2 | `kimi-k2` | — | ✅ |
| GPT-OSS 20B | `gpt-oss-20b` | 20B | — |
| Sarvam-M | `sarvam-m` | — | — |
| Qwen 2.5 0.5B | `qwen-500m` | 0.5B | — |
| Kimi K2.5 (thinking) | `kimi-2.5` | — | — |
| Gemma 3 9B | `gemma-9b` | 9B | — |
| Mistral 7B | `mistral-7b` | 7B | — |
| Qwen 2.5 7B | `qwen-7b` | 7B | — |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Enter` | Run prompt |
| `Ctrl+K` | Open templates |
| `Ctrl+E` | Export results |
| `Ctrl+/` | Keyboard shortcuts reference |
| `T` | Toggle dark/light theme |
| `Esc` | Cancel running inference |

---

## Architecture

```
Browser                    Express :8000              NVIDIA NIM API
────────                   ─────────────              ──────────────
arena/page.tsx
  └─ useInference.ts  ──►  /v1/chat/completions  ──►  model endpoint
       SSE stream     ◄──  SSE proxy             ◄──  stream
  └─ useToolCalling.ts ──► (same, with tools=[])
```

The Express proxy exists to keep your NVIDIA API key server-side and to handle CORS for streaming. All models run in parallel via `Promise.allSettled`.

---

## Stack

- **Next.js 14** App Router + TypeScript
- **React 18** + Zustand (persisted state)
- **Tailwind CSS v3** + CSS custom property token system
- **Framer Motion** + GSAP 3 + Lenis (smooth scroll)
- **Three.js r128** (dynamic import, WebGL particles)
- **Express.js** proxy (port 8000)
- **Vitest** + Testing Library (46 tests)

---

## Tests

```bash
npm test
# 46 tests — SSE parsing, error classification, tool calling
```

---

## License

MIT