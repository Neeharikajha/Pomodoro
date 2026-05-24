// src/game/player.ts
// Updated for Step 4: drawPlayer now shows a clear sitting vs walking visual.

import type { Player } from "./types";
import { isAnyKeyHeld } from "./input";

export function createPlayer(
  canvasWidth: number,
  canvasHeight: number,
): Player {
  return {
    x: canvasWidth / 2 - 16,
    y: canvasHeight / 2 - 16,
    width: 32,
    height: 32,
    speed: 180,
    state: "walking",
  };
}

export function updatePlayer(player: Player, dt: number): void {
  // Movement is fully locked while sitting — interaction.ts handles state changes
  if (player.state === "sitting") return;

  const dist = player.speed * dt;

  if (isAnyKeyHeld(["arrowup", "w"])) player.y -= dist;
  if (isAnyKeyHeld(["arrowdown", "s"])) player.y += dist;
  if (isAnyKeyHeld(["arrowleft", "a"])) player.x -= dist;
  if (isAnyKeyHeld(["arrowright", "d"])) player.x += dist;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
): void {
  const { x, y, width, height, state } = player;

  if (state === "sitting") {
    drawSitting(ctx, x, y, width, height);
  } else {
    drawWalking(ctx, x, y, width, height);
  }
}

// Walking: upright blue square with a direction nub at the top
function drawWalking(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  // Body
  ctx.fillStyle = "#60a5fa";
  ctx.fillRect(x, y, w, h);

  // Direction nub (top center)
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(x + 10, y + 4, 12, 7);

  // Subtle outline
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
}

// Sitting: shorter yellow square (squished down to look "seated")
function drawSitting(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const sittingH = h * 0.65; // visually compress the player when seated
  const sittingY = y + (h - sittingH);

  // Body
  ctx.fillStyle = "#facc15";
  ctx.fillRect(x, sittingY, w, sittingH);

  // "Relaxed" face — two dots
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x + 8, sittingY + 6, 4, 4);
  ctx.fillRect(x + 20, sittingY + 6, 4, 4);

  // Outline
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.75, sittingY + 0.75, w - 1.5, sittingH - 1.5);

  // "E to stand" hint above the player
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("[E] stand", x + w / 2, sittingY - 8);
  ctx.textAlign = "left"; // reset to default
}
