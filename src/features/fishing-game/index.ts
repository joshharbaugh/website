// Main component — drop this into your header
export { FishingGame } from "./components/FishingGame";

// Sub-components (if you want to compose them yourself)
export { FishingCanvas } from "./components/FishingCanvas";
export { FishingHUD } from "./components/FishingHUD";

// Store (if you need to read game state from outside the module)
export { useFishingStore } from "./store/useFishingStore";
export type {
  GameState,
  CatchLogEntry,
  CatchAnimation,
  Bobber,
} from "./store/useFishingStore";

// Constants & types (if you want to extend fish types, etc.)
export {
  FISH_TYPES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BITE_WINDOW_MS,
} from "./lib/constants";
export type { FishType, FishTier } from "./lib/constants";
