# fishing-game

Self-contained Next.js 15 (App Router) fishing mini-game module.
Canvas-based, pixel art style, Zustand state, Tailwind for HUD styling.

## Folder structure

```
src/features/fishing-game/
├── index.ts                        # barrel export
├── components/
│   ├── FishingGame.tsx             # root component — use this in your header
│   ├── FishingCanvas.tsx           # canvas + RAF loop wiring
│   └── FishingHUD.tsx              # score bar, message, catch log
├── hooks/
│   └── useFishingGame.ts           # RAF game loop, input, state transitions
├── store/
│   └── useFishingStore.ts          # Zustand store
└── lib/
    ├── constants.ts                # fish types, canvas dimensions, tuning values
    ├── draw.ts                     # all canvas draw functions (pure, no React)
    └── particles.ts                # particle system helpers
```

## Installation

### 1. Copy the folder

```bash
cp -r fishing-game src/features/fishing-game
```

### 2. Install peer dependencies (if not already present)

```bash
npm install zustand
```

### 3. Use in your header

```tsx
// src/app/layout.tsx  or  src/components/Header.tsx
import { FishingGame } from "@/features/fishing-game";

export default function Header() {
  return (
    <header className="w-full">
      <FishingGame canvasHeight={280} className="rounded-xl" />
    </header>
  );
}
```

The component is already marked `'use client'` — safe to import from any Server Component.

## Controls

| Action | Input                                        |
| ------ | -------------------------------------------- |
| Cast   | Click canvas or press `Space` (while idle)   |
| Reel   | Click canvas or press `Space` (while biting) |

## Fish tiers

| Tier | Name    | Label     | Bobber | Points | Wait range |
| ---- | ------- | --------- | ------ | ------ | ---------- |
| 0    | Perch   | Common    | Red    | 50     | 2–4s       |
| 1    | Bass    | Uncommon  | Green  | 120    | 3.5–7s     |
| 2    | Trout   | Rare      | Blue   | 300    | 5–9s       |
| 3    | Catfish | Epic      | Purple | 650    | 8–14s      |
| 4    | Pike    | Legendary | Gold   | 1600   | 12–20s     |

Higher-tier fish produce more aggressive bobber dip animations and larger splash particles.

## Tuning

All tunable values live in `lib/constants.ts`:

```ts
export const BITE_WINDOW_MS = 2500; // how long the player has to click on a bite

// Per-fish: wMin/wMax (wait time), spd (dip speed), amp (dip amplitude), spawnWeight
```

## Extending fish types

Add entries to the `FISH_TYPES` array in `lib/constants.ts`.
Add the corresponding draw case in `lib/draw.ts` → `drawFish()` switch statement.

## Reading score from outside the module

```ts
import { useFishingStore } from "@/features/fishing-game";

const score = useFishingStore((s) => s.score);
const caught = useFishingStore((s) => s.caught);
```
