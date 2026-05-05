<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project state (as of 2026-05-05)

- **Stack:** Next.js 16.2.4, React 19, TypeScript 5, Tailwind CSS v4, Zustand 5
- **Deployed:** Vercel (`josh-harbaughs-projects/website`) — `main` branch auto-deploys
- **Line endings:** CRLF enforced via `.prettierrc` and `.vscode/settings.json`

## Feature modules

New features go under `src/features/<name>/` with an `index.ts` barrel export. Existing example: `src/features/fishing-game/`.

## Zustand usage

Stores live in `src/features/<name>/store/`. Use scoped selectors — do not read the whole store object in a component:

```ts
const score = useFishingStore((s) => s.score); // correct
const store = useFishingStore();               // avoid
```

## Fishing game — key layout facts

All tuning knobs live in `lib/constants.ts` and the top of `lib/draw.ts`. When touching the fishing game, read these first:

- `WATER_Y = 200` — horizon; sky above, water below
- `DOCK_Y = 245` — dock surface; character stands here
- `SPRITE_SCALE = 1` — character sprites render at native 68×68px (not upscaled)
- `SPRITE_Y = DOCK_Y - 108` — character sprite top-left y
- `ROD_TIP_OX/OY = 10, 20` — fishing line anchor offset from sprite origin
- `DOCK_SPRITE_Y = DOCK_Y - 94` — dock sprite render y; `DOCK_SPRITE_W/H = 320/80`

Hot-path game state (bobber, timers, cast progress) lives in `animRef` inside `useFishingGame.ts`, not Zustand. Only HUD-visible state and `timeOfDay` live in the Zustand store.

Background sprites (dock, trees, clouds, moon, sun) are in `public/fishing-game/bg/` and loaded in `useFishingGame.ts`. The `BgSprites` interface is exported from `lib/draw.ts`. Time-of-day (`"day" | "dusk" | "night"`) is toggled from the HUD and drives sky/water/ground color palettes in `lib/draw.ts`.

## Tooling

- **Prettier** configured in `.prettierrc` — run before committing
- **ESLint** via `eslint-config-next` (Core Web Vitals + TypeScript) — `npm run lint`
- **Turbopack** used for `next dev` (not webpack)
