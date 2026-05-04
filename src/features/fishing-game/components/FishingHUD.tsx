"use client";

import { useFishingStore } from "../store/useFishingStore";

export function FishingHUD() {
  const { score, caught, stateLabel, message, messageColor, catchLog } =
    useFishingStore();

  return (
    <div className="flex flex-col bg-[#0d0818] select-none">
      {/* Score bar */}
      <div className="flex justify-between items-center px-4 py-1.5 font-mono text-[12px] text-[#e8c97a]">
        <span>
          score: <b>{score}</b>
        </span>
        <span>{stateLabel}</span>
        <span>
          caught: <b>{caught}</b>
        </span>
      </div>

      {/* Status message */}
      <div
        className="text-center px-4 py-1 font-mono text-[11px] min-h-[22px] transition-colors duration-200"
        style={{ color: messageColor }}
      >
        {message}
      </div>

      {/* Catch log */}
      {catchLog.length > 0 && (
        <div className="flex gap-1.5 flex-wrap px-4 pb-1.5 min-h-[26px]">
          {catchLog.map((entry) => (
            <span
              key={entry.id}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded border"
              style={{
                color: entry.fish.col,
                borderColor: `${entry.fish.col}44`,
              }}
            >
              +{entry.fish.pts} {entry.fish.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
