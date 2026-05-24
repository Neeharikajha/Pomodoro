// src/game/timer.ts
// A simple stopwatch. Tracks total elapsed milliseconds across multiple sit sessions.
// Accumulates time — each new sit adds to the previous total, not reset.
//
// Usage:
//   timer.start()       → called when player sits
//   timer.stop()        → called when player stands
//   timer.getDisplay()  → returns "MM:SS" string for HUD
export function createTimer() {
    let totalMs = 0; // accumulated time across all sit sessions
    let sessionStart = null; // timestamp of current sit, null when standing
    function start() {
        if (sessionStart !== null)
            return; // already running, ignore
        sessionStart = performance.now();
    }
    function stop() {
        if (sessionStart === null)
            return; // already stopped, ignore
        totalMs += performance.now() - sessionStart;
        sessionStart = null;
    }
    function getTotalMs() {
        if (sessionStart !== null) {
            // Currently sitting — include live session time
            return totalMs + (performance.now() - sessionStart);
        }
        return totalMs;
    }
    function getDisplay() {
        const ms = getTotalMs();
        const totalSec = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        return `${pad(minutes)}:${pad(seconds)}`;
    }
    return { start, stop, getDisplay, getTotalMs };
}
function pad(n) {
    return String(n).padStart(2, "0");
}
