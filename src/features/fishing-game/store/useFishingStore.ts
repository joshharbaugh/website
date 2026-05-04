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

interface FishingStore {
  // Game state
  gameState: GameState;
  score: number;
  caught: number;
  castProgress: number;
  bobber: Bobber | null;
  currentFish: FishType | null;
  waitTimer: number;
  biteTimer: number;
  bitePhase: number;
  catchAnimation: CatchAnimation | null;
  missFlash: number;
  catchLog: CatchLogEntry[];
  message: string;
  messageColor: string;
  stateLabel: string;

  // Actions
  setGameState: (s: GameState) => void;
  setCastProgress: (p: number) => void;
  setBobber: (b: Bobber | null) => void;
  setCurrentFish: (f: FishType | null) => void;
  setWaitTimer: (t: number) => void;
  setBiteTimer: (t: number) => void;
  setBitePhase: (p: number) => void;
  setCatchAnimation: (a: CatchAnimation | null) => void;
  setMissFlash: (v: number) => void;
  setMessage: (msg: string, color?: string) => void;
  setStateLabel: (label: string) => void;
  addCatch: (fish: FishType) => void;
  reset: () => void;
}

let catchIdCounter = 0;

export const useFishingStore = create<FishingStore>((set) => ({
  gameState: "idle",
  score: 0,
  caught: 0,
  castProgress: 0,
  bobber: null,
  currentFish: null,
  waitTimer: 0,
  biteTimer: 0,
  bitePhase: 0,
  catchAnimation: null,
  missFlash: 0,
  catchLog: [],
  message: "Welcome to Pixel Haven! Click or press Space to cast.",
  messageColor: "#c8a45a",
  stateLabel: "click or space to cast",

  setGameState: (gameState) => set({ gameState }),
  setCastProgress: (castProgress) => set({ castProgress }),
  setBobber: (bobber) => set({ bobber }),
  setCurrentFish: (currentFish) => set({ currentFish }),
  setWaitTimer: (waitTimer) => set({ waitTimer }),
  setBiteTimer: (biteTimer) => set({ biteTimer }),
  setBitePhase: (bitePhase) => set({ bitePhase }),
  setCatchAnimation: (catchAnimation) => set({ catchAnimation }),
  setMissFlash: (missFlash) => set({ missFlash }),
  setMessage: (message, messageColor = "#c8a45a") =>
    set({ message, messageColor }),
  setStateLabel: (stateLabel) => set({ stateLabel }),

  addCatch: (fish) =>
    set((state) => ({
      score: state.score + fish.pts,
      caught: state.caught + 1,
      catchLog: [{ fish, id: catchIdCounter++ }, ...state.catchLog].slice(0, 7),
    })),

  reset: () =>
    set({
      gameState: "idle",
      score: 0,
      caught: 0,
      castProgress: 0,
      bobber: null,
      currentFish: null,
      waitTimer: 0,
      biteTimer: 0,
      bitePhase: 0,
      catchAnimation: null,
      missFlash: 0,
      catchLog: [],
      message: "Click or press Space to cast.",
      messageColor: "#c8a45a",
      stateLabel: "click or space to cast",
    }),
}));
