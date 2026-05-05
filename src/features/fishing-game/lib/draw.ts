import { FishType, TimeOfDay } from "./constants";
import { Particle } from "./particles";
import { CatchAnimation, Bobber } from "../store/useFishingStore";
import {
  WATER_Y,
  DOCK_Y,
  CHAR_X,
  CANVAS_WIDTH as W,
  CANVAS_HEIGHT as H,
} from "./constants";

export interface BgSprites {
  dock: HTMLImageElement | null;
  treeTall: HTMLImageElement | null;
  treeShort: HTMLImageElement | null;
  cloudDay: HTMLImageElement | null;
  cloudDusk: HTMLImageElement | null;
  moon: HTMLImageElement | null;
  sun: HTMLImageElement | null;
}

function pr(n: number) {
  return Math.round(n);
}

// ─── Sky & Environment ───────────────────────────────────────────────────────

interface Star {
  x: number;
  y: number;
  s: number;
  p: number;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SKY_BANDS: Record<TimeOfDay, [number, string][]> = {
  day: [
    [0.0, "#2e68c0"],
    [0.2, "#4888d8"],
    [0.45, "#72aee8"],
    [0.7, "#a4d0f4"],
    [1.0, "#cce8fa"],
  ],
  dusk: [
    [0.0, "#12082a"],
    [0.12, "#1e0e38"],
    [0.22, "#3a1050"],
    [0.32, "#8a2a18"],
    [0.44, "#c04020"],
    [0.54, "#e06828"],
    [0.63, "#f09030"],
    [0.73, "#f8b840"],
    [0.82, "#fad060"],
    [0.9, "#fce090"],
    [1.0, "#fce090"],
  ],
  night: [
    [0.0, "#020412"],
    [0.25, "#05081e"],
    [0.5, "#080c28"],
    [0.75, "#0c1030"],
    [1.0, "#12183e"],
  ],
};

const TREE_DATA: [number, number, number][] = [
  [0, 52, 50],
  [30, 40, 68],
  [62, 48, 54],
  [100, 36, 62],
  [128, 52, 46],
  [170, 42, 58],
  [200, 32, 54],
  [216, 54, 48],
  [258, 46, 66],
  [290, 40, 50],
  [318, 58, 44],
  [362, 42, 60],
  [394, 50, 52],
  [430, 38, 58],
  [460, 44, 50],
];

export function drawSky(
  ctx: CanvasRenderingContext2D,
  frame: number,
  stars: Star[],
  clouds: Cloud[],
  timeOfDay: TimeOfDay,
  sprites: BgSprites
) {
  const bands = SKY_BANDS[timeOfDay];
  for (let i = 0; i < bands.length - 1; i++) {
    const y1 = bands[i][0] * WATER_Y;
    const y2 = bands[i + 1][0] * WATER_Y;
    ctx.fillStyle = bands[i][1];
    ctx.fillRect(0, pr(y1), W, pr(y2 - y1) + 1);
  }

  // Stars — shown at night (bright) and dusk (faint)
  if (timeOfDay !== "day") {
    const starAlphaScale = timeOfDay === "night" ? 1 : 0.3;
    const t = frame * 0.018;
    for (const s of stars) {
      const twinkle = 0.4 + 0.5 * Math.abs(Math.sin(s.p * 0.1 + t));
      ctx.globalAlpha = twinkle * (s.y < 80 ? 0.9 : 0.5) * starAlphaScale;
      ctx.fillStyle = "#fff8e0";
      ctx.fillRect(pr(s.x), pr(s.y), s.s, s.s);
    }
    ctx.globalAlpha = 1;
  }

  // Moon sprite — night only
  if (timeOfDay === "night") {
    if (sprites.moon) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprites.moon, 38, 14, 48, 48);
    } else {
      ctx.fillStyle = "#fff8d0";
      ctx.beginPath();
      ctx.arc(62, 36, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#12183e";
      ctx.beginPath();
      ctx.arc(70, 32, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sun sprite — day (upper right) and dusk (near horizon, orange-tinted)
  if (timeOfDay === "day" && sprites.sun) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprites.sun, 580, 24, 48, 48);
  } else if (timeOfDay === "dusk" && sprites.sun) {
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(sprites.sun, 600, 148, 48, 48);
    ctx.globalAlpha = 1;
  }

  // Trees
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < TREE_DATA.length; i++) {
    const [tx, tw, th] = TREE_DATA[i];
    const sprite = i % 2 === 0 ? sprites.treeTall : sprites.treeShort;
    if (sprite && timeOfDay !== "night") {
      const alpha = timeOfDay === "dusk" ? 0.85 : 1;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, pr(tx), pr(WATER_Y - th), tw, th);
      ctx.globalAlpha = 1;
    } else {
      // Dark silhouette for night or sprite fallback
      ctx.fillStyle = timeOfDay === "night" ? "#0d0818" : "#182a10";
      ctx.fillRect(
        pr(tx + tw / 2 - 3),
        pr(WATER_Y - th * 0.5),
        6,
        pr(th * 0.5)
      );
      ctx.beginPath();
      ctx.moveTo(pr(tx), pr(WATER_Y - th * 0.42));
      ctx.lineTo(pr(tx + tw / 2), pr(WATER_Y - th));
      ctx.lineTo(pr(tx + tw), pr(WATER_Y - th * 0.42));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pr(tx + 4), pr(WATER_Y - th * 0.28));
      ctx.lineTo(pr(tx + tw / 2), pr(WATER_Y - th * 0.62));
      ctx.lineTo(pr(tx + tw - 4), pr(WATER_Y - th * 0.28));
      ctx.closePath();
      ctx.fill();
    }
  }

  // Clouds — day uses fluffy white, dusk uses wispy orange, night skips
  if (timeOfDay !== "night") {
    const cloudSprite =
      timeOfDay === "day" ? sprites.cloudDay : sprites.cloudDusk;
    for (const c of clouds) {
      if (cloudSprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = timeOfDay === "dusk" ? 0.75 : 0.85;
        ctx.drawImage(cloudSprite, pr(c.x - 8), pr(c.y - 20), pr(c.w + 20), 48);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = timeOfDay === "day" ? "#e8f4ff" : "#f8c080";
        ctx.fillRect(pr(c.x), pr(c.y), pr(c.w), pr(c.h));
        ctx.fillRect(
          pr(c.x + 10),
          pr(c.y - c.h * 0.55),
          pr(c.w - 20),
          pr(c.h * 0.75)
        );
        ctx.fillRect(
          pr(c.x + 4),
          pr(c.y - c.h * 0.2),
          pr(c.w - 8),
          pr(c.h * 0.4)
        );
        ctx.globalAlpha = 1;
      }
    }
  }
}

// ─── Water ───────────────────────────────────────────────────────────────────

interface BgFish {
  x: number;
  y: number;
  d: number;
  t: number;
  fi: number;
}

const WATER_COLORS: Record<
  TimeOfDay,
  {
    base1: string;
    base2: string;
    ref1: string;
    ref1a: number;
    ref2?: string;
    ref2a?: number;
    wave: string;
  }
> = {
  day: {
    base1: "#1a5a98",
    base2: "#0e3c70",
    ref1: "#90d0f8",
    ref1a: 0.1,
    wave: "#2a6ab0",
  },
  dusk: {
    base1: "#0c1c30",
    base2: "#081420",
    ref1: "#c04820",
    ref1a: 0.15,
    ref2: "#f09030",
    ref2a: 0.1,
    wave: "#1a3a5a",
  },
  night: {
    base1: "#040e1c",
    base2: "#020810",
    ref1: "#304878",
    ref1a: 0.06,
    wave: "#0a1c30",
  },
};

export function drawWater(
  ctx: CanvasRenderingContext2D,
  waterAnim: number,
  bgFish: BgFish[],
  fishTypes: FishType[],
  fishSprites: (HTMLImageElement | null)[],
  timeOfDay: TimeOfDay
) {
  const wc = WATER_COLORS[timeOfDay];

  ctx.fillStyle = wc.base1;
  ctx.fillRect(0, WATER_Y, W, H - WATER_Y);
  ctx.fillStyle = wc.base2;
  ctx.fillRect(0, WATER_Y + 28, W, H - WATER_Y - 28);

  ctx.fillStyle = wc.ref1;
  ctx.globalAlpha = wc.ref1a;
  ctx.fillRect(0, WATER_Y, W, 16);
  ctx.globalAlpha = 1;

  if (wc.ref2 && wc.ref2a) {
    ctx.fillStyle = wc.ref2;
    ctx.globalAlpha = wc.ref2a;
    ctx.fillRect(0, WATER_Y, W, 8);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < 14; i++) {
    const rx = (waterAnim * 20 + i * 50) % W;
    ctx.strokeStyle = wc.wave;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, WATER_Y + 7 + i * 6);
    ctx.lineTo(rx + 16, WATER_Y + 7 + i * 6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (const f of bgFish) {
    const fx = f.x + Math.sin(f.t * 0.05) * 5;
    const fy = f.y + Math.sin(f.t * 0.09) * 2;
    const ft = fishTypes[f.fi % fishTypes.length];
    drawFish(ctx, pr(fx), pr(fy), f.d, ft, 0.55, fishSprites[ft.tier], f.t);
  }
}

// ─── Ground & Dock ───────────────────────────────────────────────────────────

const GROUND_LAYERS: Record<
  TimeOfDay,
  [string, string, string, string, string]
> = {
  day: ["#2a3c1a", "#3a5020", "#486828", "#5c7e30", "#688a32"],
  dusk: ["#182810", "#223812", "#2c4e18", "#386020", "#406820"],
  night: ["#0e1c08", "#182810", "#20380e", "#2a4814", "#2e4a14"],
};

export function drawGround(
  ctx: CanvasRenderingContext2D,
  timeOfDay: TimeOfDay
) {
  const [l0, l1, l2, l3, l4] = GROUND_LAYERS[timeOfDay];
  const soilCol =
    timeOfDay === "day"
      ? "#382010"
      : timeOfDay === "night"
        ? "#140a04"
        : "#200e08";

  ctx.fillStyle = l0;
  ctx.fillRect(0, WATER_Y - 2, W * 0.54, 8);
  ctx.fillStyle = l1;
  ctx.fillRect(0, WATER_Y - 8, W * 0.54, 8);
  ctx.fillStyle = l2;
  ctx.fillRect(0, WATER_Y - 14, W * 0.54, 8);
  ctx.fillStyle = l3;
  ctx.fillRect(0, WATER_Y - 20, W * 0.48, 8);
  ctx.fillStyle = l4;
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(pr(i * 20 + 3), pr(WATER_Y - 22), 2, 5);
    ctx.fillRect(pr(i * 20 + 9), pr(WATER_Y - 24), 2, 7);
  }
  ctx.fillStyle = soilCol;
  ctx.fillRect(0, WATER_Y + 4, W * 0.5, 10);
}

// Sprite render y: dock planks align with DOCK_Y. Tune if sprite content shifts.
const DOCK_SPRITE_Y = DOCK_Y - 94;
const DOCK_SPRITE_W = 320;
const DOCK_SPRITE_H = 80;

export function drawDock(
  ctx: CanvasRenderingContext2D,
  dockSprite: HTMLImageElement | null,
  timeOfDay: TimeOfDay
) {
  const dx = 308;

  if (dockSprite) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(dockSprite, dx, DOCK_SPRITE_Y, DOCK_SPRITE_W, DOCK_SPRITE_H);

    // Lantern glow — always drawn on top of sprite so it animates and reacts to time of day
    const glowAlpha =
      timeOfDay === "night" ? 0.06 : timeOfDay === "dusk" ? 0.04 : 0;
    const glowCol = timeOfDay === "day" ? "#ffe080" : "#ffe060";
    const lx = dx + 36;
    const ly = DOCK_Y - 85;
    ctx.fillStyle = glowCol;
    for (let r = 1; r <= 4; r++) {
      ctx.globalAlpha = glowAlpha;
      ctx.beginPath();
      ctx.arc(lx, ly + 6, r * 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }
}

// ─── Character ───────────────────────────────────────────────────────────────

// PixelLab ranger sprite: individual 68×68 PNG frames per animation×direction.
//   public/fishing-game/ranger/animations/animating-3275cf01/east/ — 4-frame breathing-idle
//   public/fishing-game/ranger/animations/animating-74fb7b4e/east/ — 7-frame throw-object (cast)
//   public/fishing-game/ranger/animations/animating-73714f41/east/ — 5-frame picking-up (catch)
const SRC_SIZE = 68;
const SPRITE_SCALE = 1;
const SPRITE_W = SRC_SIZE * SPRITE_SCALE;
const SPRITE_H = SRC_SIZE * SPRITE_SCALE;
// Tune so the character stands on the dock surface (DOCK_Y = 174).
const SPRITE_X = CHAR_X - 26;
const SPRITE_Y = DOCK_Y - 108;

// Pixel offset from sprite origin to the rod tip (at SPRITE_SCALE).
// Tune after visual inspection — the fishing line anchors here.
const ROD_TIP_OX = 10; // west-facing: rod extends left, tip near left edge
const ROD_TIP_OY = 20;

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  frame: number,
  gameState: string,
  idleFrames: (HTMLImageElement | null)[],
  fishingIdleFrames: (HTMLImageElement | null)[],
  castFrames: (HTMLImageElement | null)[],
  catchFrames: (HTMLImageElement | null)[],
  castProgress: number,
  catchFrameIdx: number
) {
  let frames: (HTMLImageElement | null)[];
  let frameIdx: number;

  if (catchFrameIdx >= 0) {
    frames = catchFrames;
    frameIdx = Math.min(catchFrameIdx, catchFrames.length - 1);
  } else if (gameState === "casting") {
    frames = castFrames;
    const eased = castProgress * castProgress * (3 - 2 * castProgress);
    frameIdx = Math.min(
      Math.floor(eased * castFrames.length),
      castFrames.length - 1
    );
  } else if (gameState === "waiting" || gameState === "biting") {
    frames = fishingIdleFrames;
    frameIdx = Math.floor(frame / 15) % Math.max(fishingIdleFrames.length, 1);
  } else {
    frames = idleFrames;
    frameIdx = Math.floor(frame / 60) % Math.max(idleFrames.length, 1);
  }

  const img = frames[frameIdx];
  if (!img) return;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img,
    0,
    0,
    SRC_SIZE,
    SRC_SIZE,
    SPRITE_X,
    SPRITE_Y,
    SPRITE_W,
    SPRITE_H
  );
}

export function getRodTip() {
  return { x: SPRITE_X + ROD_TIP_OX, y: SPRITE_Y + ROD_TIP_OY };
}

// ─── Line & Bobber ───────────────────────────────────────────────────────────

export function drawLine(
  ctx: CanvasRenderingContext2D,
  gameState: string,
  castProgress: number,
  bobber: Bobber | null,
  currentFish: FishType | null,
  bitePhase: number,
  biteTimer: number,
  lineJitter: number
) {
  if (gameState === "idle") return;
  const tip = getRodTip();

  if (gameState === "casting") {
    const t = castProgress;
    const ex = tip.x - t * 185;
    const ey = tip.y - Math.sin(t * Math.PI) * 70 + t * t * 140;
    ctx.strokeStyle = "#c8a060";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.quadraticCurveTo(tip.x - t * 90, tip.y - 30, ex, ey);
    ctx.stroke();
    drawBobber(ctx, ex, ey, null, false);
    return;
  }

  if (!bobber) return;
  ctx.strokeStyle = "#c8a060";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.quadraticCurveTo(tip.x - 50, tip.y + 40 + lineJitter, bobber.x, bobber.y);
  ctx.stroke();

  const biting = gameState === "biting";
  const flash =
    biting && Math.floor(bitePhase * (currentFish?.spd ?? 6)) % 2 === 0;
  drawBobber(ctx, bobber.x, bobber.y, biting ? currentFish : null, flash);
  if (biting) drawTimerArc(ctx, bobber, biteTimer, currentFish);
}

function drawBobber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fish: FishType | null,
  flash: boolean
) {
  const col = fish ? fish.bc : "#e03030";
  if (fish && flash) {
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.15;
    for (let r = 2; r <= 5; r++) {
      ctx.beginPath();
      ctx.arc(x, y, r * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = "#c8a060";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x, y - 13);
  ctx.stroke();
  ctx.fillStyle = "#1a0e08";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = flash ? "#ffffff" : col;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x - 1, y - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  if (y > WATER_Y) {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, WATER_Y + 24, 9, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawTimerArc(
  ctx: CanvasRenderingContext2D,
  bobber: Bobber,
  biteTimer: number,
  fish: FishType | null
) {
  const pct = Math.max(0, 1 - biteTimer / 2500);
  const col = fish?.col ?? "#e8c97a";
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    bobber.x,
    bobber.y - 22,
    11,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2
  );
  ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    bobber.x,
    bobber.y - 22,
    11,
    -Math.PI / 2,
    -Math.PI / 2 + pct * Math.PI * 2
  );
  ctx.stroke();
}

// ─── Fish Sprites ────────────────────────────────────────────────────────────

export function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  d: number,
  fish: FishType,
  alpha: number = 1,
  sprite?: HTMLImageElement | null,
  swimT: number = 0,
  renderSize: number = 48
) {
  ctx.globalAlpha = alpha;

  if (sprite) {
    const scaleY = 1 + Math.sin(swimT * 0.12) * 0.05;
    const hw = renderSize / 2;
    const hh = (renderSize * scaleY) / 2;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    if (d === -1) ctx.scale(-1, 1);
    ctx.drawImage(
      sprite,
      0,
      0,
      48,
      48,
      -hw,
      -hh,
      renderSize,
      renderSize * scaleY
    );
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }

  const c1 = fish.col,
    outline = "#0a0808";

  switch (fish.tier) {
    case 0: {
      ctx.fillStyle = outline;
      ctx.fillRect(x - d * 9, y - 5, 18, 11);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 8, y - 4, 16, 9);
      ctx.fillStyle = "#f8f0c0";
      ctx.fillRect(x - d * 8, y - 1, 6, 5);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 8, y - 3, 6, 7);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 9, y - 2, 5, 5);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 2, y - 9, 6, 6);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 5, y - 1, 2, 2);
      break;
    }
    case 1: {
      ctx.fillStyle = outline;
      ctx.fillRect(x - d * 11, y - 6, 22, 12);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 10, y - 5, 20, 10);
      ctx.fillStyle = "#a0e8a0";
      ctx.fillRect(x - d * 10, y - 1, 7, 5);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 10, y - 4, 8, 8);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 11, y - 3, 6, 6);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = c1;
        ctx.fillRect(x - d * (4 - i * 3), y - 10 - i, 4, 6 + i);
      }
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 7, y - 1, 2, 2);
      break;
    }
    case 2: {
      ctx.fillStyle = outline;
      ctx.fillRect(x - d * 14, y - 5, 28, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 13, y - 4, 26, 8);
      ctx.fillStyle = "#a0d0f0";
      ctx.fillRect(x - d * 13, y - 1, 9, 4);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 13, y - 5, 9, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 14, y - 4, 7, 8);
      ctx.fillStyle = "#d03030";
      ctx.fillRect(x - d * 5, y - 3, 5, 5);
      ctx.fillStyle = outline;
      for (let i = 0; i < 3; i++)
        ctx.fillRect(x - d * (1 - i * 5), y + 1, 3, 3);
      ctx.fillRect(x + d * 8, y - 1, 2, 2);
      break;
    }
    case 3: {
      ctx.fillStyle = outline;
      ctx.fillRect(x - d * 10, y - 7, 24, 14);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 9, y - 6, 22, 12);
      ctx.fillStyle = "#c090e8";
      ctx.fillRect(x - d * 9, y - 2, 8, 7);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 14, y - 4, 7, 8);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 15, y - 3, 5, 6);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 2, y - 12, 9, 6);
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - d * 9, y - 5);
      ctx.lineTo(x - d * 20, y - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - d * 9, y - 3);
      ctx.lineTo(x - d * 18, y + 2);
      ctx.stroke();
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 10, y - 1, 2, 2);
      break;
    }
    case 4: {
      ctx.fillStyle = outline;
      ctx.fillRect(x - d * 19, y - 5, 38, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 18, y - 4, 36, 8);
      ctx.fillStyle = "#f8e080";
      ctx.fillRect(x - d * 18, y - 1, 12, 4);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 19, y - 6, 11, 12);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 20, y - 5, 9, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(x - d * 4, y - 10, 11, 6);
      ctx.fillStyle = c1;
      ctx.fillRect(x + d * 8, y - 8, 7, 5);
      ctx.fillStyle = "#e0d040";
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x - d * (7 - i * 9), y - 2, 4, 4);
      ctx.fillStyle = outline;
      ctx.fillRect(x + d * 16, y - 1, 3, 3);
      break;
    }
  }
  ctx.globalAlpha = 1;
}

// ─── Catch Animation ─────────────────────────────────────────────────────────

export function drawCatchAnimation(
  ctx: CanvasRenderingContext2D,
  anim: CatchAnimation,
  fishSprites: (HTMLImageElement | null)[]
): CatchAnimation | null {
  const a = { ...anim, t: anim.t + 1 };
  const fish = a.fish;
  const sprite = fishSprites[fish.tier] ?? null;

  if (a.phase === 0) {
    const prog = Math.min(a.t / 20, 1);
    const fy = a.sy - prog * prog * 70;
    const next = { ...a, cy: fy };
    drawFish(
      ctx,
      pr(a.cx),
      pr(fy),
      1,
      fish,
      1,
      sprite,
      a.t,
      sprite ? 120 : undefined
    );
    if (a.t >= 20) return { ...next, phase: 1, t: 0 };
    return next;
  }

  if (a.phase === 1) {
    const flash = Math.floor(a.t / 3) % 2 === 0;
    if (flash) {
      ctx.fillStyle = fish.col;
      ctx.globalAlpha = 0.12;
      for (let r = 1; r <= 6; r++) {
        ctx.beginPath();
        ctx.arc(a.cx, a.cy, r * 13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawFish(
      ctx,
      pr(a.cx),
      pr(a.cy),
      1,
      fish,
      1,
      sprite,
      a.t,
      sprite ? 120 : undefined
    );
    const labelYBase = sprite ? a.cy - 76 : a.cy - 32;
    const ptsYBase = sprite ? a.cy - 64 : a.cy - 20;
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000a0";
    ctx.fillText(fish.label + "!", a.cx + 1, labelYBase + 1);
    ctx.fillStyle = fish.col;
    ctx.fillText(fish.label + "!", a.cx, labelYBase);
    ctx.fillStyle = "#000000a0";
    ctx.fillText("+" + fish.pts, a.cx + 1, ptsYBase + 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("+" + fish.pts, a.cx, ptsYBase);
    ctx.textAlign = "left";
    if (a.t >= 28) return { ...a, phase: 2, t: 0 };
    return a;
  }

  // Phase 2 — fade out
  drawFish(
    ctx,
    pr(a.cx),
    pr(a.cy),
    1,
    fish,
    Math.max(0, 1 - a.t / 14),
    sprite,
    a.t,
    sprite ? 120 : undefined
  );
  if (a.t >= 14) return null;
  return a;
}

// ─── Particles ───────────────────────────────────────────────────────────────

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.col;
    ctx.fillRect(pr(p.x), pr(p.y), pr(p.sz), pr(p.sz));
  }
  ctx.globalAlpha = 1;
}

// ─── Miss Flash overlay ──────────────────────────────────────────────────────

export function drawMissFlash(
  ctx: CanvasRenderingContext2D,
  missFlash: number
) {
  if (missFlash <= 0) return;
  ctx.fillStyle = `rgba(180,40,10,${Math.min(1, missFlash / 300) * 0.22})`;
  ctx.fillRect(0, 0, W, H);
}
