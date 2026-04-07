# LLM Arena — Agent Handoff Document
> Paste this entire document at the start of any new agent session.
> The agent will have full context to continue without breaking anything.

---

## PROJECT IDENTITY

**Name:** LLM Arena  
**Type:** Next.js 14 full-stack LLM benchmarking tool  
**Location:** `C:/Users/rahul/OneDrive/Desktop/llm-arena`  
**Current status:** Steps 1–11 complete. Step 12 (final wiring + QA) is next.

---

## WHAT THIS APP DOES

A self-hosted browser app that fires the same prompt at multiple LLMs
simultaneously and compares their responses, speed, and tool-calling
capability side by side.

Key features:
- SSE streaming responses from 11 NVIDIA-hosted models simultaneously
- Real-time TTFT, TPS, token count, latency metrics per card
- Tool calling detection — which models actually call tools vs ignore them
- Leaderboard ranked by TPS after all models finish
- History, export (JSON/CSV/MD/TXT), keyboard shortcuts, dark/light theme
- Three.js WebGL particle background
- Landing page with GSAP scroll animations

---

## TECH STACK (never deviate from this)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router |
| Language | TypeScript — no plain .js in app/ |
| UI | React 18 |
| Styling | Tailwind CSS v3 + CSS custom properties for ALL design tokens |
| Animation | Framer Motion + GSAP 3 + Lenis |
| 3D | Three.js r128 (dynamic import only — never top-level) |
| State | Zustand + persist middleware |
| Fonts | Plus Jakarta Sans + JetBrains Mono ONLY |
| Backend | Express.js proxy on port 8000 |
| Tests | Vitest + @testing-library/react |

---

## CRITICAL DESIGN RULES (enforce these always)

1. NEVER use #000000 or #ffffff — always use CSS variable tokens
2. CSS tokens: --bg, --bg-1, --bg-2, --bg-3, --ink, --ink-2/3/4, --accent, --accent-hi, --accent-glow, --green, --red, --amber, --shadow-sm/md/lg/glow, --r-xs through --r-full
3. GPU-only animations: transform + opacity ONLY — never animate width/height/top/left/margin/padding
4. All animations: ease-out entry, ease-in exit, max 500ms duration
5. Body text minimum 16px, line-height 1.65–1.75
6. Three.js MUST be dynamically imported inside useEffect — never at file top level
7. All components using browser APIs must have "use client" directive
8. No Chart.js anywhere

---

## COMPLETE FILE STRUCTURE

```
llm-arena/
├── app/
│   ├── page.tsx                    ← Landing page (Hero, StatsBar, etc.)
│   ├── layout.tsx                  ← Root layout, ThemeProvider, ToastContainer, anti-flash script
│   ├── globals.css                 ← Full CSS token system (dark + light)
│   └── arena/
│       └── page.tsx                ← Full arena SPA (wrapped in Suspense)
│
├── components/
│   ├── arena/
│   │   ├── EmptyState.tsx          ← Static empty state illustration
│   │   ├── LeaderboardStrip.tsx    ← Post-run TPS leaderboard
│   │   ├── ModelChipBar.tsx        ← Horizontal scrollable model toggles
│   │   ├── PromptBar.tsx           ← Fixed-bottom prompt input
│   │   ├── ResponseCard.tsx        ← Per-model streaming card with metrics
│   │   ├── ResponseGrid.tsx        ← CSS grid of response cards
│   │   ├── Sidebar.tsx             ← Collapsible nav sidebar
│   │   ├── Topbar.tsx              ← Sticky header with status + theme
│   │   └── views/
│   │       ├── HistoryView.tsx     ← Run history list
│   │       └── SettingsView.tsx    ← Live settings form
│   │
│   ├── landing/
│   │   ├── Hero.tsx                ← Animated hero with demo cards
│   │   ├── StatsBar.tsx            ← 4 stats with GSAP count-up
│   │   ├── HowItWorks.tsx          ← 4-step flow
│   │   ├── ModelsGrid.tsx          ← All 11 model cards
│   │   ├── FeaturesBento.tsx       ← Asymmetric feature grid
│   │   └── FinalCTA.tsx            ← CTA + quickstart code block
│   │
│   ├── modals/
│   │   ├── ModalOverlay.tsx        ← Base modal (focus trap, Esc, scroll lock)
│   │   ├── SystemPromptModal.tsx   ← System prompt editor with 5 presets
│   │   ├── TemplatesModal.tsx      ← 13 templates with category tabs
│   │   ├── ExportModal.tsx         ← 4 export format tiles
│   │   └── ShortcutsModal.tsx      ← Keyboard shortcut reference
│   │
│   ├── tool-calling/
│   │   ├── ToolCallBadge.tsx       ← Animated tool call status badge
│   │   └── ToolMockToggle.tsx      ← Tool mode pill toggle
│   │
│   ├── ui/
│   │   ├── Banner.tsx              ← Full-width dismissible banner
│   │   ├── Button.tsx              ← 3 variants (primary/ghost/danger)
│   │   ├── SkeletonCard.tsx        ← Loading placeholder matching ResponseCard
│   │   ├── SkeletonLine.tsx        ← Single shimmer line
│   │   ├── ThemeProvider.tsx       ← Theme context + useTheme hook
│   │   ├── Toast.tsx               ← Individual toast notification
│   │   ├── ToastContainer.tsx      ← Toast stack + useToastStore + useToast hook
│   │   └── ToggleSwitch.tsx        ← Spring-animated toggle
│   │
│   └── webgl/
│       └── ParticleBackground.tsx  ← Three.js particles (dynamic import, SSR:false)
│
├── hooks/
│   ├── useArenaStore.ts            ← Re-exports Zustand store from lib/state
│   ├── useInference.ts             ← Core SSE streaming hook with fallback
│   ├── useKeyboardShortcuts.ts     ← Global keyboard shortcut registration
│   ├── useLayout.ts                ← Responsive grid column calculator
│   ├── useLenis.ts                 ← Smooth scroll init (dynamic import)
│   ├── useModelHealth.ts           ← Probes each model endpoint
│   ├── useSSEFallback.ts           ← Non-streaming fallback hook
│   ├── useTheme.ts                 ← Re-exports useTheme from ThemeProvider
│   └── useToolCalling.ts           ← Two-phase tool detection + streaming
│
├── lib/
│   ├── cn.ts                       ← classnames utility
│   ├── endpoints.ts                ← SERVER_CONFIG + resolveModelEndpoint()
│   ├── errors.ts                   ← classifyError() + ErrorType enum
│   ├── export.ts                   ← exportJSON/CSV/Markdown/Text
│   ├── models.ts                   ← MODELS array (11 models, 4 default active)
│   ├── shortcuts.ts                ← SHORTCUT_LABELS map
│   ├── state.ts                    ← Zustand store with persist (key: "ia-store")
│   ├── templates.ts                ← 13 prompt templates
│   ├── tools.ts                    ← TOOL_DEFINITIONS + executeToolCall() mock
│   └── uuid.ts                     ← generateId() using crypto.randomUUID
│
├── server/
│   ├── index.js                    ← Express proxy (CommonJS, port 8000)
│   ├── package.json                ← express + dotenv only
│   ├── .env                        ← NVIDIA_API_KEY=nvapi-... (user's real key)
│   └── .env.example                ← Template
│
├── types/
│   └── index.ts                    ← All TypeScript interfaces + enums
│
├── __tests__/
│   ├── setup.ts                    ← jest-dom + polyfills
│   ├── streaming.test.ts           ← 20 SSE parsing + error classification tests
│   └── tool-calling.test.ts        ← 26 tool definition + mock data tests
│
├── .env.local                      ← NEXT_PUBLIC_PROXY_URL=http://localhost:8000
├── next.config.mjs                 ← transpilePackages: ["three"]
├── tailwind.config.ts              ← darkMode: "class", font extends
└── vitest.config.ts                ← jsdom, "@" alias, setupFiles
```

---

## MODELS (11 total, 4 default active)

| ID | Full API Name | Color | Active |
|----|--------------|-------|--------|
| mistral-24b | mistralai/mistral-small-24b-instruct-2501 | #8b5cf6 | ✅ |
| llama-8b | meta/llama-3.1-8b-instruct | #f97316 | ✅ |
| qwen-24b | qwen/qwen2.5-72b-instruct | #ec4899 | ✅ |
| kimi-k2 | moonshotai/kimi-k2-instruct | #a78bfa | ✅ |
| gpt-oss-20b | gpt-oss-20b | #06b6d4 | ❌ |
| sarvam-m | sarvamai/sarvam-m | #f59e0b | ❌ |
| qwen-500m | qwen/qwen2.5-0.5b-instruct | #14b8a6 | ❌ |
| kimi-2.5 | moonshotai/kimi-k2.5 | #6366f1 | ❌ |
| gemma-9b | google/gemma-3-9b-it | #4ade80 | ❌ |
| mistral-7b | mistralai/mistral-7b-instruct-v0.3 | #fb923c | ❌ |
| qwen-7b | qwen/qwen2.5-7b-instruct | #38bdf8 | ❌ |

Special model overrides in lib/endpoints.ts:
- kimi-2.5: chat_template_kwargs.thinking=true, max_tokens=16384
- kimi-k2: max_tokens=16384

---

## ZUSTAND STORE (key: "ia-store" in localStorage)

Persisted state:
- baseUrl: "http://localhost:8000"
- apiKey: ""
- activeModels: ["mistral-24b","llama-8b","qwen-24b","kimi-k2"]
- systemPrompt: ""
- showMetrics: true
- autoScroll: true
- modelEndpoints: {}
- theme: "dark"
- toolMode: false
- webglEnabled: true

Session state (resets on reload):
- history, metricsLog, runCount, totalTokens, ttftSamples
- lastResults, cardStates, isRunning

---

## HOW THE INFERENCE FLOW WORKS

1. User types prompt → clicks Run
2. arena/page.tsx calls handleRun()
3. All active models set to "loading" state
4. Promise.allSettled fires runModel() or runModelWithTools() per model
5. Each model goes: loading → streaming → done/error/cancelled
6. useInference.ts: POST to localhost:8000/v1/chat/completions with stream:true
7. SSE loop: ReadableStream + TextDecoder, split on \n, parse data: lines
8. TTFT recorded on first non-empty token
9. TPS = tokenCount / ((elapsed - ttft) / 1000)
10. onToken() → textsRef.current updated → RAF batches setTexts()
11. On stream end → onDone() → card goes "done"
12. Network error → useSSEFallback (stream:false, non-streaming)
13. AbortError → cancelled state (no fallback)
14. After all settle → leaderboard shows, history entry added

Tool calling (useToolCalling.ts):
- Phase 1: POST stream:false with tools=[TOOL_DEFINITIONS]
- If finish_reason="tool_calls": execute mock tool, build messages
- Phase 2: POST stream:true with updated messages → stream final answer
- If finish_reason="stop": model didn't call tool → show response directly

---

## CURRENT STATE — STEP 12 IS NEXT

Steps 1–11 are 100% complete and working:
- App runs: npm run dev (port 3000)
- Server runs: cd server && node index.js (port 8000)
- Tests pass: npm test (46/46)
- Landing page: http://localhost:3000
- Arena: http://localhost:3000/arena

Step 12 — Final Wiring & QA — needs to:
1. Add CompareView.tsx stub (file exists but is empty)
2. Final TypeScript audit (npx tsc --noEmit)
3. Mobile responsive fixes (≤640px breakpoint)
4. Performance pass (will-change cleanup, dynamic imports audit)
5. Setup instructions document

Step 13 — Polish:
1. Design token compliance audit (no #000/#fff)
2. WCAG AA contrast check
3. Animation audit (no forbidden properties)
4. Final README

---

## COMMANDS TO REMEMBER

```bash
# Frontend dev server
npm run dev

# Backend proxy (separate terminal)
cd server && node index.js

# TypeScript check
npx tsc --noEmit

# Tests
npm test

# Build
npm run build
```

---

## ENVIRONMENT FILES

`llm-arena/.env.local`:
```
NEXT_PUBLIC_PROXY_URL=http://localhost:8000
```

`llm-arena/server/.env`:
```
NVIDIA_API_KEY=nvapi-your-actual-key
PORT=8000
```

---

## WHAT TO DO WHEN CONTINUING

If continuing Step 12, instruct the agent:
"We are at Step 12 of 13. Steps 1-11 are complete and working.
All files listed in the handoff doc exist and have full implementations.
46 tests pass. Please continue with Step 12: final wiring, mobile
responsive fixes, TypeScript audit, and setup documentation."

If a file needs to be modified, always:
1. Write the COMPLETE file — never partial snippets
2. Maintain all existing imports
3. Keep "use client" directives
4. Never add #000000 or #ffffff
5. Never import Three.js at the top level

---

## KNOWN WORKING FEATURES (do not regress these)

- [x] Dark/light theme toggle (T key or topbar button)
- [x] All 11 model chips toggle correctly  
- [x] Sidebar collapses to 64px
- [x] Prompt bar Ctrl+Enter triggers run
- [x] Ctrl+K opens templates modal with 5 tabs
- [x] Ctrl+/ opens shortcuts modal
- [x] Ctrl+E opens export modal
- [x] Leaderboard appears after run completes
- [x] WebGL particles toggle via Settings
- [x] Landing page hero animation sequence
- [x] GSAP scroll reveals on landing sections
- [x] History records runs with metrics
- [x] Settings live-updates store without save button
- [x] Toast notifications for success/error/warning
- [x] 46 Vitest tests all passing
