import { create } from "zustand";
import { FishType } from "../lib/constants";

export type GameState = "idle" | "casting" | "waiting" | "biting";

export interface CatchLogEntry {
  fish: FishType;
  id: number;
}

export interface CatchAnimation {
  fish: FishType;
  cx: number;
  cy: number;
  sx: number;
  sy: number;
  t: number;
  phase: 0 | 1 | 2;
}

export interface Bobber {
  x: number;
  y: number;
  baseY: number;
}

// Only HUD-visible state lives here. Hot-path game state (bobber y, timers,
// bitePhase, castProgress, currentFish) lives in the hook's animRef to avoid
// per-frame React re-renders.
interface FishingStore {
  score: number;
  caught: number;
  catchLog: CatchLogEntry[];
  message: string;
  messageColor: string;
  stateLabel: string;

  addCatch: (fish: FishType) => void;
  setMessage: (msg: string, color?: string) => void;
  setStateLabel: (label: string) => void;
  reset: () => void;
}

let catchIdCounter = 0;

const INITIAL_STATE = {
  score: 0,
  caught: 0,
  catchLog: [] as CatchLogEntry[],
  message: "Welcome to Pixel Haven! Click or press Space to cast.",
  messageColor: "#c8a45a",
  stateLabel: "click or space to cast",
};

export const useFishingStore = create<FishingStore>((set) => ({
  ...INITIAL_STATE,

  addCatch: (fish) =>
    set((state) => ({
      score: state.score + fish.pts,
      caught: state.caught + 1,
      catchLog: [{ fish, id: catchIdCounter++ }, ...state.catchLog].slice(0, 7),
    })),

  setMessage: (message, messageColor = "#c8a45a") =>
    set({ message, messageColor }),

  setStateLabel: (stateLabel) => set({ stateLabel }),

  reset: () => set(INITIAL_STATE),
}));
