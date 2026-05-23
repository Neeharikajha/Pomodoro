// src/game/player.ts
// Owns the Player object and the logic that moves it each frame.
// Reads from input.ts — knows nothing about React or canvas drawing.

import type { Player } from "./types";
import { isAnyKeyHeld } from "./input";

export function createPlayer(
  canvasWidth: number,
  canvasHeight: number,
): Player {
  return {
    x: canvasWidth / 2 - 16, // centered
    y: canvasHeight / 2 - 16,
    width: 32,
    height: 32,
    speed: 180, // pixels per second
    state: "walking",
  };
}

export function updatePlayer(player: Player, dt: number): void {
  // Don't move while sitting — interaction.ts will handle state changes
  if (player.state === "sitting") return;

  const dist = player.speed * dt; // frame-independent distance

  if (isAnyKeyHeld(["arrowup", "w"])) player.y -= dist;
  if (isAnyKeyHeld(["arrowdown", "s"])) player.y += dist;
  if (isAnyKeyHeld(["arrowleft", "a"])) player.x -= dist;
  if (isAnyKeyHeld(["arrowright", "d"])) player.x += dist;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
): void {
  ctx.fillStyle = player.state === "sitting" ? "#facc15" : "#60a5fa"; // yellow when sitting, blue when walking
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Subtle direction indicator — a small darker square at the top of the player
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(player.x + 10, player.y + 4, 12, 6);
}
