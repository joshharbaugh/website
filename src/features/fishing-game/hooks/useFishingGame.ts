"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFishingStore } from "../store/useFishingStore";
import type {
  GameState,
  Bobber,
  CatchAnimation,
} from "../store/useFishingStore";
import { Particle, spawnParticles, updateParticles } from "../lib/particles";
import {
  drawSky,
  drawWater,
  drawGround,
  drawDock,
  drawCharacter,
  drawLine,
  drawCatchAnimation,
  drawParticles,
  drawMissFlash,
} from "../lib/draw";
import {
  FISH_TYPES,
  FishType,
  pickFish,
  rnd,
  BITE_WINDOW_MS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WATER_Y,
} from "../lib/constants";
import {
  initAudio,
  playSplash,
  playBite,
  playCatch,
  playMiss,
} from "../lib/audio";

const SPLASH_COLS = ["#5ba3dc", "#7ecfb3", "#aaddff"];
const CATCH_COLS = ["#5ba3dc", "#7ecfb3", "#fff", "#f0c030"];

interface AnimState {
  // Ambient / visual
  frame: number;
  waterAnim: number;
  stars: { x: number; y: number; s: number; p: number }[];
  clouds: { x: number; y: number; w: number; h: number }[];
  bgFish: { x: number; y: number; d: number; t: number; fi: number }[];
  particles: Particle[];
  lastTime: number;
  // Hot-path game state — mutated directly in the RAF loop, never written to Zustand
  gameState: GameState;
  castProgress: number;
  bobber: Bobber | null;
  currentFish: FishType | null;
  waitTimer: number;
  biteTimer: number;
  bitePhase: number;
  missFlash: number;
  catchAnimation: CatchAnimation | null;
  sprites: {
    idle: (HTMLImageElement | null)[];
    cast: (HTMLImageElement | null)[];
    catch: (HTMLImageElement | null)[];
  };
}

export function useFishingGame(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const animRef = useRef<AnimState>({
    frame: 0,
    waterAnim: 0,
    stars: Array.from({ length: 40 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: 10 + Math.random() * 110,
      s: Math.random() > 0.65 ? 2 : 1,
      p: Math.random() * 200,
    })),
    clouds: [
      { x: 50, y: 28, w: 88, h: 20 },
      { x: 270, y: 16, w: 72, h: 18 },
      { x: 490, y: 26, w: 82, h: 20 },
    ],
    bgFish: [
      { x: 110, y: 226, d: 1, t: 0, fi: 0 },
      { x: 360, y: 238, d: -1, t: 35, fi: 1 },
      { x: 570, y: 222, d: 1, t: 18, fi: 2 },
    ],
    particles: [],
    lastTime: 0,
    gameState: "idle",
    castProgress: 0,
    bobber: null,
    currentFish: null,
    waitTimer: 0,
    biteTimer: 0,
    bitePhase: 0,
    missFlash: 0,
    catchAnimation: null,
    sprites: {
      idle: [null, null, null, null],
      cast: [null, null, null, null, null, null, null],
      catch: [null, null, null, null, null],
    },
  });

  const rafRef = useRef<number | null>(null);

  const doReel = useCallback(() => {
    const anim = animRef.current;
    // Unlock AudioContext on first user gesture (browser autoplay policy)
    initAudio();
    // Actions are stable in Zustand v5 — safe to read from getState() without subscribing
    const { addCatch, setMessage, setStateLabel } = useFishingStore.getState();

    if (anim.gameState === "biting") {
      const fish = anim.currentFish!;
      playCatch();
      addCatch(fish);
      if (anim.bobber) {
        spawnParticles(
          anim.bobber.x,
          anim.bobber.y,
          28,
          CATCH_COLS,
          true,
          anim.particles
        );
        anim.catchAnimation = {
          fish,
          cx: anim.bobber.x,
          cy: anim.bobber.y,
          sx: anim.bobber.x,
          sy: anim.bobber.y,
          t: 0,
          phase: 0,
        };
      }
      setMessage(`${fish.label} ${fish.name} caught! +${fish.pts}`, fish.col);
      setStateLabel("click or space to cast");
      anim.bobber = null;
      anim.biteTimer = 0;
      anim.gameState = "idle";
    } else if (anim.gameState === "waiting") {
      setMessage("Nothing biting yet... patience!");
    } else if (anim.gameState === "idle") {
      anim.gameState = "casting";
      anim.castProgress = 0;
      setStateLabel("casting...");
      setMessage("Line in the air!");
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        doReel();
      }
    };
    const onCanvasClick = () => doReel();
    const canvas = canvasRef.current;
    canvas?.addEventListener("click", onCanvasClick);
    window.addEventListener("keydown", onKey);
    return () => {
      canvas?.removeEventListener("click", onCanvasClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [canvasRef, doReel]);

  useEffect(() => {
    const BASE = "/fishing-game/ranger/animations";
    const loadFrames = (dir: string, arr: (HTMLImageElement | null)[]) => {
      arr.forEach((_, i) => {
        const img = new Image();
        const idx = String(i).padStart(3, "0");
        img.onload = () => {
          arr[i] = img;
        };
        img.src = `${BASE}/${dir}/west/frame_${idx}.png`;
      });
    };
    const s = animRef.current.sprites;
    loadFrames("animating-3275cf01", s.idle); // breathing-idle
    loadFrames("animating-74fb7b4e", s.cast); // throw-object (cast)
    loadFrames("animating-73714f41", s.catch); // picking-up (catch)
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop(ts: number) {
      const anim = animRef.current;
      const dt = Math.min(ts - anim.lastTime, 100);
      anim.lastTime = ts;
      anim.frame++;
      anim.waterAnim += dt * 0.0008;
      for (const st of anim.stars) st.p += dt * 0.01;
      for (const c of anim.clouds) {
        c.x += 0.1;
        if (c.x > CANVAS_WIDTH + 50) c.x = -c.w - 10;
      }
      for (const f of anim.bgFish) {
        f.t += dt / 16;
        f.x += f.d * 0.38 * (dt / 16);
        if (f.x > CANVAS_WIDTH + 30) f.x = -30;
        if (f.x < -30) f.x = CANVAS_WIDTH + 30;
      }
      anim.particles = updateParticles(anim.particles, dt);

      // State machine — only Zustand writes are the setMessage/setStateLabel calls
      // on transitions (a few times per game cycle), not per frame.
      if (anim.gameState === "casting") {
        anim.castProgress += dt * 0.00075;
        if (anim.castProgress >= 1) {
          const bx = rnd(50, 250);
          const by = WATER_Y + rnd(8, 22);
          const fish = pickFish();
          anim.bobber = { x: bx, y: by, baseY: by };
          anim.currentFish = fish;
          anim.waitTimer = rnd(fish.wMin, fish.wMax);
          anim.gameState = "waiting";
          playSplash();
          const { setMessage, setStateLabel } = useFishingStore.getState();
          setStateLabel("waiting...");
          setMessage("Bobber in. Wait for the bite...");
        }
      }

      if (anim.gameState === "waiting") {
        if (anim.bobber)
          anim.bobber.y = anim.bobber.baseY + Math.sin(ts * 0.003) * 2.5;
        anim.waitTimer -= dt;
        if (anim.waitTimer <= 0) {
          anim.gameState = "biting";
          anim.biteTimer = BITE_WINDOW_MS;
          anim.bitePhase = 0;
          if (anim.bobber)
            spawnParticles(
              anim.bobber.x,
              anim.bobber.y,
              14,
              SPLASH_COLS,
              true,
              anim.particles
            );
          playBite();
          const { setMessage, setStateLabel } = useFishingStore.getState();
          setStateLabel("BITE! click now!");
          setMessage("Fish on the line! Click fast!", anim.currentFish?.col);
        }
      }

      if (anim.gameState === "biting") {
        anim.bitePhase += dt * 0.001;
        if (anim.bobber && anim.currentFish) {
          const dip =
            Math.abs(Math.sin(anim.bitePhase * anim.currentFish.spd)) *
            anim.currentFish.amp;
          anim.bobber.y = anim.bobber.baseY + dip;
          if (
            dip > anim.currentFish.amp * 0.45 &&
            Math.random() < 0.07 * (dt / 16)
          ) {
            spawnParticles(
              anim.bobber.x,
              anim.bobber.baseY + dip * 0.4,
              2,
              SPLASH_COLS,
              true,
              anim.particles
            );
          }
        }
        anim.biteTimer -= dt;
        if (anim.biteTimer <= 0) {
          anim.missFlash = 500;
          anim.bobber = null;
          anim.gameState = "idle";
          anim.currentFish = null;
          playMiss();
          const { setMessage, setStateLabel } = useFishingStore.getState();
          setMessage("The fish got away! Try again.", "#e05030");
          setStateLabel("click or space to cast");
        }
      }

      if (anim.missFlash > 0) anim.missFlash -= dt;

      // Draw
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawSky(ctx!, anim.frame, anim.stars, anim.clouds);
      drawWater(ctx!, anim.waterAnim, anim.bgFish, FISH_TYPES);
      drawGround(ctx!);
      drawDock(ctx!);
      drawParticles(ctx!, anim.particles);
      let catchFrame = -1;
      if (anim.catchAnimation) {
        const { phase, t } = anim.catchAnimation;
        const totalT = phase === 0 ? t : phase === 1 ? 20 + t : 48 + t;
        catchFrame = Math.min(Math.floor(totalT / 12), 4); // 5 frames (0-4)
      }
      drawCharacter(
        ctx!,
        anim.frame,
        anim.gameState,
        anim.sprites.idle,
        anim.sprites.cast,
        anim.sprites.catch,
        anim.castProgress,
        catchFrame
      );
      drawLine(
        ctx!,
        anim.gameState,
        anim.castProgress,
        anim.bobber,
        anim.currentFish,
        anim.bitePhase,
        anim.biteTimer
      );

      if (anim.catchAnimation) {
        anim.catchAnimation = drawCatchAnimation(ctx!, anim.catchAnimation);
      }

      drawMissFlash(ctx!, anim.missFlash);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);

  return { doReel };
}
