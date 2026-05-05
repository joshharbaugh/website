@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16** app using the **App Router** with React 19, TypeScript, Tailwind CSS v4, and **Zustand 5** for state management. Deployed to Vercel (linked to `josh-harbaughs-projects/website`); pushes to `main` auto-deploy.

- `src/app/` — App Router root. `layout.tsx` is the root layout; `page.tsx` is the home route. New routes are folders with a `page.tsx` inside.
- `src/app/globals.css` — Global styles. Tailwind is imported via `@import "tailwindcss"`. CSS custom properties (`--background`, `--foreground`) drive theming; dark mode via `@media (prefers-color-scheme: dark)`.
- `src/features/` — Self-contained feature modules. Each exports its public API via an `index.ts` barrel.
- `@/*` maps to `src/*` (e.g. `import Foo from "@/components/Foo"`).

## Features

### fishing-game (`src/features/fishing-game/`)

Canvas-based pixel-art fishing mini-game. Import and use:

```tsx
import { FishingGame } from "@/features/fishing-game";
<FishingGame canvasHeight={280} className="rounded-xl" />
```

Internal structure:
- `components/` — `FishingGame` (root), `FishingCanvas` (canvas + RAF), `FishingHUD` (score/log/scene toggle)
- `hooks/useFishingGame.ts` — game loop, input handling, state transitions, sprite loading
- `store/useFishingStore.ts` — Zustand store; game states: `idle | casting | waiting | biting`; also holds `timeOfDay`
- `lib/constants.ts` — fish types/tiers, canvas dimensions, tuning values, `TimeOfDay` type
- `lib/draw.ts` — pure canvas draw functions; exports `BgSprites` interface
- `lib/particles.ts` — particle system helpers
- `lib/audio.ts` — audio helpers

Controls: click or `Space` to cast/reel. Fish tiers 0–4 (Perch → Pike), tunable in `lib/constants.ts`. To add a fish type, add to `FISH_TYPES` and handle it in `drawFish()` in `lib/draw.ts`.

**Canvas layout (all values in `lib/constants.ts`):**

| Constant | Value | Purpose |
|---|---|---|
| `CANVAS_WIDTH` | 680 | Full canvas width |
| `CANVAS_HEIGHT` | 300 | Full canvas height |
| `WATER_Y` | 200 | Sky/water horizon line |
| `DOCK_Y` | 245 | Dock surface / character standing y |
| `CHAR_X` | 388 | Character horizontal center |

**Background sprites (`public/fishing-game/bg/`):**

PixelLab-generated pixel art sprites composited over procedural sky/water gradients:

| File | Size | Used for |
|---|---|---|
| `dock.png` | 320×320px | Dock structure (rendered 320×80 at `DOCK_SPRITE_Y = DOCK_Y - 94`) |
| `tree-tall.png` | 48×48px | Tall pine trees in treeline |
| `tree-short.png` | 56×56px | Short pine trees in treeline |
| `cloud-day.png` | 96×96px | Fluffy white clouds (day scene) |
| `cloud-dusk.png` | 96×96px | Wispy orange clouds (dusk scene) |
| `moon.png` | 48×48px | Crescent moon (night scene) |
| `sun.png` | 48×48px | Sun with rays (day/dusk scenes) |

**Time-of-day scenes:**

`TimeOfDay = "day" | "dusk" | "night"` — lives in the Zustand store (`timeOfDay`, default `"dusk"`). Cycled via `cycleTimeOfDay()` and a HUD button. Each scene has its own sky gradient palette (`SKY_BANDS`), water colors (`WATER_COLORS`), and ground colors (`GROUND_LAYERS`) defined in `lib/draw.ts`. Night uses procedural dark silhouette trees; day/dusk use tree sprites.

**Character sprite tuning (`lib/draw.ts`):**

```
SPRITE_SCALE = 1   — sprites render at native 68×68px
SPRITE_X = CHAR_X - 26
SPRITE_Y = DOCK_Y - 108
ROD_TIP_OX = 10, ROD_TIP_OY = 20  — fishing line anchor offset from sprite origin
```

Read game state from outside the module:
```ts
import { useFishingStore } from "@/features/fishing-game";
const score = useFishingStore((s) => s.score);
const timeOfDay = useFishingStore((s) => s.timeOfDay);
```

## Key conventions

- Fonts: Geist Sans and Geist Mono via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`, mapped to Tailwind's `font-sans` / `font-mono` in `globals.css` under `@theme inline`.
- ESLint: `eslint-config-next` (Core Web Vitals + TypeScript). Config in `eslint.config.mjs`.
- Prettier: `.prettierrc` — double quotes, semicolons, `endOfLine: crlf`, 80-char print width.
- TypeScript strict mode. `moduleResolution: bundler` — named imports only, no CommonJS `require`.
- Files use **CRLF** line endings (enforced by `.prettierrc` and `.vscode/settings.json`).
