export const CANVAS_WIDTH = 680;
export const CANVAS_HEIGHT = 300;
export const WATER_Y = 200;
export const DOCK_Y = 245;
export const CHAR_X = 388;

export const BITE_WINDOW_MS = 2500;

export type TimeOfDay = "day" | "dusk" | "night";

export type FishTier = 0 | 1 | 2 | 3 | 4;

export interface FishType {
  name: string;
  tier: FishTier;
  label: string;
  col: string; // UI / catch label color
  bc: string; // bobber color when biting
  pts: number;
  wMin: number; // min wait ms before bite
  wMax: number; // max wait ms before bite
  spd: number; // bobber dip oscillation speed
  amp: number; // bobber dip amplitude (px)
  spawnWeight: number;
}

export const FISH_TYPES: FishType[] = [
  {
    name: "Perch",
    tier: 0,
    label: "Common",
    col: "#e8c97a",
    bc: "#e03030",
    pts: 50,
    wMin: 2000,
    wMax: 4000,
    spd: 5,
    amp: 8,
    spawnWeight: 6,
  },
  {
    name: "Bass",
    tier: 1,
    label: "Uncommon",
    col: "#6dbf6d",
    bc: "#20b020",
    pts: 120,
    wMin: 3500,
    wMax: 7000,
    spd: 7,
    amp: 12,
    spawnWeight: 4,
  },
  {
    name: "Trout",
    tier: 2,
    label: "Rare",
    col: "#5ba3dc",
    bc: "#2060e0",
    pts: 300,
    wMin: 5000,
    wMax: 9000,
    spd: 10,
    amp: 16,
    spawnWeight: 2,
  },
  {
    name: "Catfish",
    tier: 3,
    label: "Epic",
    col: "#b06fe0",
    bc: "#8820d0",
    pts: 650,
    wMin: 8000,
    wMax: 14000,
    spd: 14,
    amp: 21,
    spawnWeight: 1,
  },
  {
    name: "Pike",
    tier: 4,
    label: "Legendary",
    col: "#f0c030",
    bc: "#e08000",
    pts: 1600,
    wMin: 12000,
    wMax: 20000,
    spd: 18,
    amp: 26,
    spawnWeight: 1,
  },
];

export function pickFish(): FishType {
  const pool: FishType[] = [];
  for (const f of FISH_TYPES) {
    for (let i = 0; i < f.spawnWeight; i++) pool.push(f);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}
