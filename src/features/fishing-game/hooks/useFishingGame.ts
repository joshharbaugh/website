"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFishingStore } from "../store/useFishingStore";
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
  pickFish,
  rnd,
  BITE_WINDOW_MS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WATER_Y,
} from "../lib/constants";

const SPLASH_COLS = ["#5ba3dc", "#7ecfb3", "#aaddff"];
const CATCH_COLS = ["#5ba3dc", "#7ecfb3", "#fff", "#f0c030"];

interface AnimState {
  frame: number;
  waterAnim: number;
  stars: { x: number; y: number; s: number; p: number }[];
  clouds: { x: number; y: number; w: number; h: number }[];
  bgFish: { x: number; y: number; d: number; t: number; fi: number }[];
  particles: Particle[];
  lastTime: number;
}

export function useFishingGame(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const store = useFishingStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  // Mutable anim state — lives outside React to avoid triggering re-renders
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
  });

  const rafRef = useRef<number | null>(null);

  const doReel = useCallback(() => {
    const s = storeRef.current;

    if (s.gameState === "biting") {
      const fish = s.currentFish!;
      s.addCatch(fish);
      if (s.bobber) {
        spawnParticles(
          s.bobber.x,
          s.bobber.y,
          28,
          CATCH_COLS,
          true,
          animRef.current.particles
        );
        s.setCatchAnimation({
          fish,
          cx: s.bobber.x,
          cy: s.bobber.y,
          sx: s.bobber.x,
          sy: s.bobber.y,
          t: 0,
          phase: 0,
        });
      }
      s.setMessage(`${fish.label} ${fish.name} caught! +${fish.pts}`, fish.col);
      s.setStateLabel("click or space to cast");
      s.setBobber(null);
      s.setGameState("idle");
      s.setBiteTimer(0);
    } else if (s.gameState === "waiting") {
      s.setMessage("Nothing biting yet... patience!");
    } else if (s.gameState === "idle") {
      s.setGameState("casting");
      s.setCastProgress(0);
      s.setStateLabel("casting...");
      s.setMessage("Line in the air!");
    }
  }, []);

  // Input listeners
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

  // RAF game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop(ts: number) {
      const anim = animRef.current;
      const s = storeRef.current;
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

      // State transitions
      if (s.gameState === "casting") {
        const next = s.castProgress + dt * 0.0015;
        if (next >= 1) {
          const bx = rnd(530, 635);
          const by = WATER_Y + rnd(8, 22);
          const fish = pickFish();
          s.setBobber({ x: bx, y: by, baseY: by });
          s.setCurrentFish(fish);
          s.setWaitTimer(rnd(fish.wMin, fish.wMax));
          s.setGameState("waiting");
          s.setStateLabel("waiting...");
          s.setMessage("Bobber in. Wait for the bite...");
        } else {
          s.setCastProgress(next);
        }
      }

      if (s.gameState === "waiting") {
        const nextWait = s.waitTimer - dt;
        if (s.bobber)
          s.setBobber({
            ...s.bobber,
            y: s.bobber.baseY + Math.sin(ts * 0.003) * 2.5,
          });
        if (nextWait <= 0) {
          s.setGameState("biting");
          s.setBiteTimer(BITE_WINDOW_MS);
          s.setBitePhase(0);
          s.setStateLabel("BITE! click now!");
          s.setMessage("Fish on the line! Click fast!", s.currentFish?.col);
          if (s.bobber)
            spawnParticles(
              s.bobber.x,
              s.bobber.y,
              14,
              SPLASH_COLS,
              true,
              anim.particles
            );
        } else {
          s.setWaitTimer(nextWait);
        }
      }

      if (s.gameState === "biting") {
        const nextBite = s.biteTimer - dt;
        const nextPhase = s.bitePhase + dt * 0.001;
        if (s.bobber && s.currentFish) {
          const dip =
            Math.abs(Math.sin(nextPhase * s.currentFish.spd)) *
            s.currentFish.amp;
          s.setBobber({ ...s.bobber, y: s.bobber.baseY + dip });
          if (
            dip > s.currentFish.amp * 0.45 &&
            Math.random() < 0.07 * (dt / 16)
          ) {
            spawnParticles(
              s.bobber.x,
              s.bobber.baseY + dip * 0.4,
              2,
              SPLASH_COLS,
              true,
              anim.particles
            );
          }
        }
        s.setBitePhase(nextPhase);
        if (nextBite <= 0) {
          s.setMissFlash(500);
          s.setMessage("The fish got away! Try again.", "#e05030");
          s.setStateLabel("click or space to cast");
          s.setBobber(null);
          s.setGameState("idle");
          s.setCurrentFish(null);
        } else {
          s.setBiteTimer(nextBite);
        }
      }

      if (s.missFlash > 0) s.setMissFlash(s.missFlash - dt);

      // Update catch animation
      if (s.catchAnimation) {
        s.setCatchAnimation(s.catchAnimation); // trigger read in draw
      }

      // Draw
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawSky(ctx!, anim.frame, anim.stars, anim.clouds);
      drawWater(ctx!, anim.waterAnim, anim.bgFish, FISH_TYPES);
      drawGround(ctx!);
      drawDock(ctx!);
      drawParticles(ctx!, anim.particles);
      drawCharacter(ctx!, anim.frame);
      drawLine(
        ctx!,
        s.gameState,
        s.castProgress,
        s.bobber,
        s.currentFish,
        s.bitePhase,
        s.biteTimer
      );

      if (s.catchAnimation) {
        const next = drawCatchAnimation(ctx!, s.catchAnimation);
        if (next !== s.catchAnimation) s.setCatchAnimation(next);
      }

      drawMissFlash(ctx!, s.missFlash);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);

  return { doReel };
}
