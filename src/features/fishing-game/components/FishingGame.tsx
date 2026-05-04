"use client";

import { FishingCanvas } from "./FishingCanvas";
import { FishingHUD } from "./FishingHUD";

interface FishingGameProps {
  /** Height of the canvas in px. HUD sits below. Default 300. */
  canvasHeight?: number;
  className?: string;
}

export function FishingGame({
  canvasHeight = 300,
  className = "",
}: FishingGameProps) {
  return (
    <div className={`bg-[#1a0e2e] overflow-hidden ${className}`}>
      <FishingCanvas height={canvasHeight} />
      <FishingHUD />
    </div>
  );
}
