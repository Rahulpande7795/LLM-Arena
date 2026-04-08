# ⚔️ LLM Arena

> A high-performance, self-hosted LLM benchmarking playground.

Fire the same prompt at up to **Self-hosted models simultaneously** and compare their **responses, speed, and tool-calling behavior** in real time.

---

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vitest](https://img.shields.io/badge/Tests-46%20passing-green?logo=vitest)
![Status](https://img.shields.io/badge/Status-Step%2012%20of%2013-orange)

---

## ✨ What makes this different?

LLM Arena is built for **real benchmarking**, not just chatting with models.

* ⚡ True **parallel inference** (not sequential)
* 📡 **SSE streaming** for real-time token flow
* 🧠 **Tool-calling detection** (who actually uses tools?)
* 📊 **Live performance metrics**
* 🏆 Instant **leaderboard ranking**

---

## 🚀 Features

| Feature                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| 🔥 **Parallel inference**      | Run prompts across 11 models simultaneously  |
| ⚡ **Live metrics**             | TTFT, TPS, latency, token count per model    |
| 🛠️ **Tool calling detection** | Two-phase execution reveals real tool usage  |
| 🏆 **Leaderboard**             | Models ranked by tokens/sec after completion |
| 📤 **Export system**           | JSON · CSV · Markdown · TXT                  |
| 🎨 **Theme system**            | Dark/light with persistence                  |
| 📱 **Responsive UI**           | Fully usable on mobile                       |
| ⌨️ **Keyboard-driven**         | Power-user shortcuts                         |
| 🌌 **WebGL background**        | Three.js particle field (toggleable)         |
| 🧾 **History tracking**        | Persistent run logs with metrics             |

---

## 🧠 Supported Models (11)

| ID          | Model             | Provider    | Default |
| ----------- | ----------------- | ----------- | ------- |
| mistral-24b | Mistral Small 24B | Mistral AI  | ✅       |
| llama-8b    | Llama 3.1 8B      | Meta        | ✅       |
| qwen-24b    | Qwen 2.5 72B      | Alibaba     | ✅       |
| kimi-k2     | Kimi K2           | Moonshot AI | ✅       |
| gpt-oss-20b | GPT-OSS 20B       | OpenAI OSS  | —       |
| sarvam-m    | Sarvam M          | Sarvam AI   | —       |
| qwen-500m   | Qwen 0.5B         | Alibaba     | —       |
| kimi-2.5    | Kimi K2.5         | Moonshot AI | —       |
| gemma-9b    | Gemma 3 9B        | Google      | —       |
| mistral-7b  | Mistral 7B        | Mistral AI  | —       |
| qwen-7b     | Qwen 7B           | Alibaba     | —       |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Setup environment
cp server/.env.example server/.env
# Add your NVIDIA API key

# 3. Start backend (Terminal 1)
cd server && node index.js

# 4. Start frontend (Terminal 2)
npm run dev
```

👉 Open: **http://localhost:3000**

---

## 🏗️ Architecture

```
Frontend (Next.js 14 App Router)
│
├── Arena UI (Streaming Cards)
├── Zustand Store (Persisted)
├── Hooks (Inference + Tool Calling)
│
▼
Express Proxy (localhost:8000)
│
▼
NVIDIA API (build.nvidia.com)
```

### Flow

1. User submits prompt
2. All active models start simultaneously
3. SSE streaming begins
4. Metrics calculated in real-time
5. Tool-calling handled (2-phase execution)
6. Leaderboard generated after completion

---

## 🧩 Core Concepts

### ⚡ Streaming Engine

* Uses **ReadableStream + TextDecoder**
* Parses SSE chunks (`data:` lines)
* Batches UI updates via `requestAnimationFrame`

### 📊 Metrics

* **TTFT** → Time to first token
* **TPS** → Tokens per second
* **Latency** → Full completion time

### 🛠️ Tool Calling

* Phase 1: Detect tool intent
* Phase 2: Execute mock tool + continue stream

---

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action         |
| -------------- | -------------- |
| `Ctrl + Enter` | Run prompt     |
| `Ctrl + K`     | Open templates |
| `Ctrl + E`     | Export results |
| `Ctrl + /`     | Show shortcuts |
| `Esc`          | Cancel run     |
| `T`            | Toggle theme   |
| `[` / `]`      | Switch views   |

---

## 🧪 Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run tests (46 passing)
npx tsc --noEmit     # Type check
cd server && node index.js  # Start backend
```

---

## 📁 Project Structure (Simplified)

```
app/
  ├── page.tsx        # Landing page
  └── arena/          # Main app

components/
  ├── arena/          # Core UI
  ├── landing/        # Marketing sections
  ├── modals/         # Modals
  └── ui/             # Shared UI

hooks/
  ├── useInference.ts
  ├── useToolCalling.ts

lib/
  ├── state.ts
  ├── models.ts
  ├── tools.ts

server/
  └── Express proxy (port 8000)
```
