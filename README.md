# LLM Arena

A self-hosted browser application that fires the same prompt at up to **11 NVIDIA-hosted LLMs simultaneously** and compares their responses, speed, and tool-calling capabilities side by side.

![LLM Arena](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Vitest](https://img.shields.io/badge/Tests-46%20passing-green?logo=vitest)

---

## Features

| Feature | Details |
|---------|---------|
| 🔥 **Simultaneous inference** | Fire prompts at up to 11 models at once via SSE streaming |
| ⚡ **Real-time metrics** | TTFT, TPS, token count, and latency per model card |
| 🛠️ **Tool calling** | Two-phase detection — see which models actually call tools |
| 🏆 **Leaderboard** | Ranked by tokens-per-second after all models finish |
| 📤 **Export** | JSON, CSV, Markdown, or plain text |
| 🎨 **Dark / Light theme** | Persisted preference, instant toggle |
| 📱 **Responsive** | Full mobile layout with off-canvas sidebar |
| ⌨️ **Keyboard shortcuts** | `Ctrl+Enter` · `Ctrl+K` · `Ctrl+E` · `Ctrl+/` · `T` |
| 🌐 **WebGL background** | Three.js particle field (toggleable) |

---

## Supported Models (11)

| Model | Provider | Default |
|-------|----------|---------|
| Mistral Small 24B | Mistral AI | ✅ |
| Llama 3.1 8B | Meta | ✅ |
| Qwen 2.5 72B | Alibaba | ✅ |
| Kimi K2 | Moonshot AI | ✅ |
| GPT-OSS 20B | OpenAI OSS | — |
| Sarvam M | Sarvam AI | — |
| Qwen 2.5 0.5B | Alibaba | — |
| Kimi K2.5 | Moonshot AI | — |
| Gemma 3 9B | Google | — |
| Mistral 7B | Mistral AI | — |
| Qwen 2.5 7B | Alibaba | — |

---

## Quick Start

See [SETUP.md](./SETUP.md) for full setup instructions.

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp server/.env.example server/.env
# Add your NVIDIA API key to server/.env

# 3. Start backend proxy (terminal 1)
cd server && node index.js

# 4. Start frontend (terminal 2)
npm run dev

# Open http://localhost:3000
```

---

## Architecture

```
Browser (Next.js 14)          Express Proxy (port 8000)
┌─────────────────────┐       ┌──────────────────────┐
│  arena/page.tsx     │──────▶│  /v1/chat/completions │──▶ NVIDIA API
│  useInference.ts    │  SSE  │                      │    (build.nvidia.com)
│  useToolCalling.ts  │◀──────│                      │
└─────────────────────┘       └──────────────────────┘
         │
    Zustand Store (persisted)
    CSS Design Tokens
    Framer Motion + GSAP
```

---

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm test             # Run 46 Vitest tests
npx tsc --noEmit     # TypeScript check
npx next lint        # ESLint check
cd server && node index.js  # Start proxy (port 8000)
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run prompt |
| `Ctrl+K` | Open templates |
| `Ctrl+E` | Export results |
| `Ctrl+/` | Show shortcuts |
| `Escape` | Stop all runs |
| `T` | Toggle theme |
| `[` / `]` | Previous / Next view |

---

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v3 + CSS custom properties
- **Animation**: Framer Motion + GSAP 3 + Lenis smooth scroll
- **3D**: Three.js (dynamic import, WebGL particles)
- **State**: Zustand + persist middleware
- **Backend**: Express.js proxy (CommonJS, port 8000)
- **Tests**: Vitest + @testing-library/react (46 tests)
- **Fonts**: Plus Jakarta Sans + JetBrains Mono

---

## License

MIT