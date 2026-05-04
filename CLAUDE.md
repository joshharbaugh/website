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
- `components/` — `FishingGame` (root), `FishingCanvas` (RAF loop), `FishingHUD` (score/log)
- `hooks/useFishingGame.ts` — game loop, input handling, state transitions
- `store/useFishingStore.ts` — Zustand store; states: `idle | casting | waiting | biting`
- `lib/constants.ts` — fish types/tiers, canvas dimensions, tuning values
- `lib/draw.ts` — pure canvas draw functions
- `lib/particles.ts` — particle system helpers

Controls: click or `Space` to cast/reel. Fish tiers 0–4 (Perch → Pike), tunable in `lib/constants.ts`. To add a fish type, add to `FISH_TYPES` and handle it in `drawFish()` in `lib/draw.ts`.

Read game state from outside the module:
```ts
import { useFishingStore } from "@/features/fishing-game";
const score = useFishingStore((s) => s.score);
```

## Key conventions

- Fonts: Geist Sans and Geist Mono via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`, mapped to Tailwind's `font-sans` / `font-mono` in `globals.css` under `@theme inline`.
- ESLint: `eslint-config-next` (Core Web Vitals + TypeScript). Config in `eslint.config.mjs`.
- Prettier: `.prettierrc` — double quotes, semicolons, `endOfLine: crlf`, 80-char print width.
- TypeScript strict mode. `moduleResolution: bundler` — named imports only, no CommonJS `require`.
- Files use **CRLF** line endings (enforced by `.prettierrc` and `.vscode/settings.json`).
