import type { RemotePlayer } from "../net/client";
import { getSprite, preloadSprites } from "./sprites";

preloadSprites();

export function drawRemotePlayers(
  ctx: CanvasRenderingContext2D,
  players: Map<string, RemotePlayer>,
): void {
  for (const player of players.values()) {
    drawRemotePlayer(ctx, player);
  }
}

function drawRemotePlayer(
  ctx: CanvasRenderingContext2D,
  player: RemotePlayer,
): void {
  const { x, y, state, avatar, character, name, seatTimer, seatStart } = player;
  const w = 72;
  const h = 72;

  // Live seated seconds: base from last broadcast + elapsed since sitting started locally
  const liveSecs =
    state === "sitting" && seatStart > 0
      ? seatTimer + Math.floor((performance.now() - seatStart) / 1000)
      : seatTimer;

  const timeLabel = formatTime(liveSecs);
  const sprite = character ? getSprite(character) : null;
  const spriteReady = sprite && sprite.complete && sprite.naturalWidth > 0;

  ctx.save();

  if (spriteReady) {
    const bobY = state === "walking" ? Math.sin(Date.now() / 150) * 1.5 : 0;
    ctx.globalAlpha = state === "sitting" ? 0.85 : 1;
    ctx.drawImage(sprite!, x, y + bobY, w, h);
    ctx.globalAlpha = 1;
  } else if (avatar) {
    // Emoji avatar — no box, just the emoji
    ctx.font = `${w * 0.55}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(avatar, x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  }
  // If neither ready: invisible until loaded (no yellow box)

  ctx.restore();

  drawTimeLabel(ctx, x + w / 2, y - 6, name, timeLabel, state === "sitting");
}

function drawTimeLabel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  name: string,
  timeLabel: string,
  isSitting: boolean,
): void {
  ctx.font = "11px monospace";
  ctx.textAlign = "center";

  const label = isSitting ? `⏱ ${timeLabel}` : timeLabel;
  const metrics = ctx.measureText(label);
  const pw = metrics.width + 10;
  const ph = 14;

  ctx.fillStyle = isSitting ? "rgba(250,204,21,0.25)" : "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, y - ph + 2, pw, ph, 4);
  ctx.fill();

  ctx.fillStyle = isSitting ? "#facc15" : "rgba(255,255,255,0.7)";
  ctx.fillText(label, cx, y);

  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(name, cx, y + 13);

  ctx.textAlign = "left";
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
