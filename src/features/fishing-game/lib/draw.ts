import { FishType } from "./constants";
import { Particle } from "./particles";
import { CatchAnimation, Bobber } from "../store/useFishingStore";
import {
  WATER_Y,
  DOCK_Y,
  CHAR_X,
  CANVAS_WIDTH as W,
  CANVAS_HEIGHT as H,
} from "./constants";

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

export function drawSky(
  ctx: CanvasRenderingContext2D,
  frame: number,
  stars: Star[],
  clouds: Cloud[]
) {
  const bands: [number, string][] = [
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
  ];
  for (let i = 0; i < bands.length - 1; i++) {
    const y1 = bands[i][0] * WATER_Y;
    const y2 = bands[i + 1][0] * WATER_Y;
    ctx.fillStyle = bands[i][1];
    ctx.fillRect(0, pr(y1), W, pr(y2 - y1) + 1);
  }

  // Stars
  const t = frame * 0.018;
  for (const s of stars) {
    const twinkle = 0.4 + 0.5 * Math.abs(Math.sin(s.p * 0.1 + t));
    ctx.globalAlpha = twinkle * (s.y < 80 ? 0.9 : 0.5);
    ctx.fillStyle = "#fff8e0";
    ctx.fillRect(pr(s.x), pr(s.y), s.s, s.s);
  }
  ctx.globalAlpha = 1;

  // Moon
  ctx.fillStyle = "#fff8d0";
  ctx.beginPath();
  ctx.arc(62, 36, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e0e38";
  ctx.beginPath();
  ctx.arc(70, 32, 13, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  for (const c of clouds) {
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#f8c080";
    ctx.fillRect(pr(c.x), pr(c.y), pr(c.w), pr(c.h));
    ctx.fillRect(
      pr(c.x + 10),
      pr(c.y - c.h * 0.55),
      pr(c.w - 20),
      pr(c.h * 0.75)
    );
    ctx.fillRect(pr(c.x + 4), pr(c.y - c.h * 0.2), pr(c.w - 8), pr(c.h * 0.4));
    ctx.globalAlpha = 1;
  }

  // Silhouette tree line
  ctx.fillStyle = "#0d0818";
  const treeData: [number, number, number][] = [
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
  for (const [tx, tw, th] of treeData) {
    ctx.fillRect(pr(tx + tw / 2 - 3), pr(WATER_Y - th * 0.5), 6, pr(th * 0.5));
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

// ─── Water ───────────────────────────────────────────────────────────────────

interface BgFish {
  x: number;
  y: number;
  d: number;
  t: number;
  fi: number;
}

export function drawWater(
  ctx: CanvasRenderingContext2D,
  waterAnim: number,
  bgFish: BgFish[],
  fishTypes: FishType[]
) {
  ctx.fillStyle = "#0c1c30";
  ctx.fillRect(0, WATER_Y, W, H - WATER_Y);
  ctx.fillStyle = "#081420";
  ctx.fillRect(0, WATER_Y + 28, W, H - WATER_Y - 28);
  ctx.fillStyle = "#c04820";
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, WATER_Y, W, 16);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f09030";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, WATER_Y, W, 8);
  ctx.globalAlpha = 1;

  for (let i = 0; i < 14; i++) {
    const rx = (waterAnim * 20 + i * 50) % W;
    ctx.strokeStyle = "#1a3a5a";
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
    drawFish(
      ctx,
      pr(fx),
      pr(fy),
      f.d,
      fishTypes[f.fi % fishTypes.length],
      0.55
    );
  }
}

// ─── Ground & Dock ───────────────────────────────────────────────────────────

export function drawGround(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#182810";
  ctx.fillRect(0, WATER_Y - 2, W * 0.54, 8);
  ctx.fillStyle = "#223812";
  ctx.fillRect(0, WATER_Y - 8, W * 0.54, 8);
  ctx.fillStyle = "#2c4e18";
  ctx.fillRect(0, WATER_Y - 14, W * 0.54, 8);
  ctx.fillStyle = "#386020";
  ctx.fillRect(0, WATER_Y - 20, W * 0.48, 8);
  ctx.fillStyle = "#406820";
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(pr(i * 20 + 3), pr(WATER_Y - 22), 2, 5);
    ctx.fillRect(pr(i * 20 + 9), pr(WATER_Y - 24), 2, 7);
  }
  ctx.fillStyle = "#200e08";
  ctx.fillRect(0, WATER_Y + 4, W * 0.5, 10);
}

export function drawDock(ctx: CanvasRenderingContext2D) {
  const dx = 308,
    dw = 375;

  // Piling shadows
  ctx.fillStyle = "#00000040";
  for (let i = 0; i < 5; i++) {
    const px = dx + 16 + i * (dw / 4.6);
    ctx.fillRect(pr(px + 3), pr(DOCK_Y + 22), 8, H - DOCK_Y - 22);
  }

  // Pilings
  for (let i = 0; i < 5; i++) {
    const px = dx + 16 + i * (dw / 4.6);
    ctx.fillStyle = "#3a1e08";
    ctx.fillRect(pr(px), pr(DOCK_Y + 22), 8, H - DOCK_Y - 22);
    ctx.fillStyle = "#5a3010";
    ctx.fillRect(pr(px), pr(DOCK_Y + 22), 3, H - DOCK_Y - 22);
    ctx.fillStyle = "#6b4018";
    ctx.fillRect(pr(px - 2), pr(DOCK_Y + 18), 12, 6);
    ctx.fillStyle = "#3a1e08";
    ctx.fillRect(pr(px - 3), pr(DOCK_Y + 18), 14, 3);
  }

  // Deck planks
  for (let i = 0; i < 20; i++) {
    const px = dx + i * (dw / 20);
    ctx.fillStyle = i % 2 === 0 ? "#8b5c28" : "#7a4c20";
    ctx.fillRect(pr(px), pr(DOCK_Y), pr(dw / 20 - 1), 22);
    ctx.fillStyle = "#c09060";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(pr(px), pr(DOCK_Y), pr(dw / 20 - 1), 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#2a1008";
    ctx.fillRect(pr(px), pr(DOCK_Y + 20), pr(dw / 20 - 1), 2);
  }

  // Railing posts
  for (let i = 0; i < 5; i++) {
    const px = dx + i * (dw / 4);
    ctx.fillStyle = "#4a2808";
    ctx.fillRect(pr(px), pr(DOCK_Y - 20), 5, 20);
    ctx.fillStyle = "#6b3810";
    ctx.fillRect(pr(px), pr(DOCK_Y - 20), 2, 20);
    ctx.fillStyle = "#5a3010";
    ctx.fillRect(pr(px - 2), pr(DOCK_Y - 23), 9, 5);
  }
  ctx.fillStyle = "#6b3810";
  ctx.fillRect(pr(dx), pr(DOCK_Y - 22), dw, 4);
  ctx.fillStyle = "#8b5020";
  ctx.fillRect(pr(dx), pr(DOCK_Y - 22), dw, 2);

  // Lantern
  const lx = dx + 8,
    ly = DOCK_Y - 44;
  ctx.fillStyle = "#2a1008";
  ctx.fillRect(pr(lx + 4), pr(ly - 6), 4, 8);
  ctx.fillStyle = "#3a1e08";
  ctx.fillRect(pr(lx), pr(ly), 14, 18);
  ctx.fillStyle = "#6b4010";
  ctx.fillRect(pr(lx), pr(ly), 14, 3);
  ctx.fillStyle = "#6b4010";
  ctx.fillRect(pr(lx), pr(ly + 15), 14, 3);
  ctx.fillStyle = "#ffe080";
  ctx.globalAlpha = 0.95;
  ctx.fillRect(pr(lx + 2), pr(ly + 3), 10, 12);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffe060";
  for (let r = 1; r <= 4; r++) {
    ctx.globalAlpha = 0.07;
    ctx.beginPath();
    ctx.arc(lx + 7, ly + 9, r * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Character ───────────────────────────────────────────────────────────────

// PixelLab ranger sprite: individual 68×68 PNG frames per animation×direction.
//   public/fishing-game/ranger/animations/animating-3275cf01/east/ — 4-frame breathing-idle
//   public/fishing-game/ranger/animations/animating-74fb7b4e/east/ — 7-frame throw-object (cast)
//   public/fishing-game/ranger/animations/animating-73714f41/east/ — 5-frame picking-up (catch)
const SRC_SIZE = 68;
const SPRITE_SCALE = 2;
const SPRITE_W = SRC_SIZE * SPRITE_SCALE; // 136
const SPRITE_H = SRC_SIZE * SPRITE_SCALE; // 136
// Tune so the character stands on the dock surface (DOCK_Y = 174).
const SPRITE_X = CHAR_X - 46; // 342
const SPRITE_Y = DOCK_Y - 112; // 62 — character feet at ~56px in source × 2

// Pixel offset from sprite origin to the rod tip (at SPRITE_SCALE).
// Tune after visual inspection — the fishing line anchors here.
const ROD_TIP_OX = 32; // west-facing: rod extends left, tip near left edge
const ROD_TIP_OY = 50;

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
    frameIdx = Math.floor(frame / 30) % Math.max(idleFrames.length, 1);
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
    ctx.ellipse(x, WATER_Y + 2, 9, 3, 0, 0, Math.PI * 2);
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
  alpha: number = 1
) {
  ctx.globalAlpha = alpha;
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
  anim: CatchAnimation
): CatchAnimation | null {
  const a = { ...anim, t: anim.t + 1 };
  const fish = a.fish;

  if (a.phase === 0) {
    const prog = Math.min(a.t / 20, 1);
    const fy = a.sy - prog * prog * 70;
    const next = { ...a, cy: fy };
    drawFish(ctx, pr(a.cx), pr(fy), 1, fish, 1);
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
    drawFish(ctx, pr(a.cx), pr(a.cy), 1, fish, 1);
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000a0";
    ctx.fillText(fish.label + "!", a.cx + 1, a.cy - 31);
    ctx.fillStyle = fish.col;
    ctx.fillText(fish.label + "!", a.cx, a.cy - 32);
    ctx.fillStyle = "#000000a0";
    ctx.fillText("+" + fish.pts, a.cx + 1, a.cy - 19);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("+" + fish.pts, a.cx, a.cy - 20);
    ctx.textAlign = "left";
    if (a.t >= 28) return { ...a, phase: 2, t: 0 };
    return a;
  }

  // Phase 2 — fade out
  drawFish(ctx, pr(a.cx), pr(a.cy), 1, fish, Math.max(0, 1 - a.t / 14));
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
