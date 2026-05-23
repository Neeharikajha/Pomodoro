// src/game/loop.ts
// The game loop. Owns the RAF cycle, delta time, and orchestrates
// update → draw each frame. Wires in input and player for Step 2.

import type { StateChangeCallback } from "./types";
import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";

export function startLoop(
  canvas: HTMLCanvasElement,
  onStateChange: StateChangeCallback,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context from canvas");

  // --- Init subsystems ---
  const cleanupInput = initInput();
  const player = createPlayer(canvas.width, canvas.height);

  let lastTime = 0;
  let animId = 0;

  // --- Main loop ---
  const tick = (timestamp: number) => {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds; capped at 50ms to avoid huge jumps on tab resume
    lastTime = timestamp;

    // Update
    updatePlayer(player, dt);

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#1c1917";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player
    drawPlayer(ctx, player);

    // --- Notify React of state (Step 5 will make this meaningful) ---
    onStateChange(player.state, "00:00");

    animId = requestAnimationFrame(tick);
  };

  // Kick off — use performance.now() so first dt isn't huge
  lastTime = performance.now();
  animId = requestAnimationFrame(tick);

  // Cleanup: stop RAF + remove key listeners
  return () => {
    cancelAnimationFrame(animId);
    cleanupInput();
  };
}
