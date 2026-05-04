"use client";

import { useRef } from "react";
import { useFishingGame } from "../hooks/useFishingGame";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../lib/constants";

interface FishingCanvasProps {
  height?: number;
}

export function FishingCanvas({ height = 300 }: FishingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFishingGame(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block w-full cursor-crosshair"
      style={{ height, imageRendering: "pixelated" }}
      aria-label="Pixel Haven fishing mini-game. Click or press Space to cast."
    />
  );
}
