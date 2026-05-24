// src/components/HUD.tsx
// Displays the session timer and player status.
// Pure React + Tailwind — no game logic, no canvas knowledge.
// Receives everything it needs as props from App.tsx.

import type { PlayerState } from "../game/types";

interface Props {
  time: string; // formatted "MM:SS" from timer.getDisplay()
  status: PlayerState; // 'walking' | 'sitting'
}

export default function HUD({ time, status }: Props) {
  const isSitting = status === "sitting";

  return (
    <div className="flex items-center gap-6 px-6 py-3 rounded-xl bg-stone-900 border border-stone-700 shadow-lg font-mono select-none">
      {/* Timer */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-stone-500 text-xs uppercase tracking-widest">
          time seated
        </span>
        <span
          className={`text-3xl tabular-nums font-bold tracking-tight transition-colors duration-300 ${
            isSitting ? "text-yellow-400" : "text-stone-300"
          }`}
        >
          {time}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-stone-700" />

      {/* Status badge */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-stone-500 text-xs uppercase tracking-widest">
          status
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
            isSitting
              ? "bg-yellow-400/15 text-yellow-400 ring-1 ring-yellow-400/40"
              : "bg-stone-800 text-stone-400 ring-1 ring-stone-600"
          }`}
        >
          {isSitting ? "🪑 sitting" : "🚶 walking"}
        </span>
      </div>

      {/* Hint — only shown while walking */}
      {!isSitting && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-stone-500 text-xs uppercase tracking-widest">
            hint
          </span>
          <span className="text-stone-500 text-sm">
            walk to bench →{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 text-xs font-sans">
              E
            </kbd>
          </span>
        </div>
      )}
    </div>
  );
}
