"use client";

import { useFishingStore } from "../store/useFishingStore";

const TOD_LABEL: Record<string, string> = { day: "DAY", dusk: "DUSK", night: "NIGHT" };
const TOD_COLOR: Record<string, string> = {
  day: "#f8c020",
  dusk: "#f08030",
  night: "#9070d0",
};

export function FishingHUD() {
  const { score, caught, stateLabel, message, messageColor, catchLog, timeOfDay, cycleTimeOfDay } =
    useFishingStore();

  return (
    <div className="flex flex-col bg-[#0d0818] select-none">
      {/* Score bar */}
      <div className="flex justify-between items-center px-4 py-1.5 font-mono text-[12px] text-[#e8c97a]">
        <span>
          score: <b>{score}</b>
        </span>
        <span>{stateLabel}</span>
        <div className="flex items-center gap-3">
          <span>
            caught: <b>{caught}</b>
          </span>
          <button
            onClick={cycleTimeOfDay}
            className="font-mono text-[10px] px-1.5 py-0.5 rounded border cursor-pointer transition-colors"
            style={{ color: TOD_COLOR[timeOfDay], borderColor: `${TOD_COLOR[timeOfDay]}55` }}
          >
            {TOD_LABEL[timeOfDay]}
          </button>
        </div>
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
