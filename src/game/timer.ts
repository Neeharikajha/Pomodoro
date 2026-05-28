// src/game/timer.ts
// A simple stopwatch. Tracks total elapsed milliseconds across multiple sit sessions.
// Accumulates time — each new sit adds to the previous total, not reset.
//
// Usage:
//   timer.start()       → called when player sits
//   timer.stop()        → called when player stands
//   timer.getDisplay()  → returns "MM:SS" string for HUD

export interface Timer {
  start: () => void;
  stop: () => void;
  getDisplay: () => string;
  getTotalMs: () => number;
  getSeconds: () => number;
}

export function createTimer(): Timer {
  let totalMs = 0; // accumulated time across all sit sessions
  let sessionStart: number | null = null; // timestamp of current sit, null when standing

  function start(): void {
    if (sessionStart !== null) return; // already running, ignore
    sessionStart = performance.now();
  }

  function stop(): void {
    if (sessionStart === null) return; // already stopped, ignore
    totalMs += performance.now() - sessionStart;
    sessionStart = null;
  }

  function getTotalMs(): number {
    if (sessionStart !== null) {
      // Currently sitting — include live session time
      return totalMs + (performance.now() - sessionStart);
    }
    return totalMs;
  }

  function getDisplay(): string {
    const ms = getTotalMs();
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function getSeconds(): number {
    return Math.floor(getTotalMs() / 1000);
  }

  return { start, stop, getDisplay, getTotalMs, getSeconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
