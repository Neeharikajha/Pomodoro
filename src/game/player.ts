import type { Player } from "./types";
import { isAnyKeyHeld } from "./input";
import { getSprite } from "./sprites";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./world";

export function createPlayer(
  canvasWidth: number,
  canvasHeight: number,
  character = "Boy1",
): Player {
  return {
    x: canvasWidth / 2 - 36,
    y: canvasHeight / 2 - 36,
    width: 80, // 48 * 1.5
    height: 88,
    speed: 180,
    state: "walking",
    character,
    facing: "right",
  };
}

export function updatePlayer(player: Player, dt: number): void {
  if (player.state === "sitting") return;

  const dist = player.speed * dt;

  if (isAnyKeyHeld(["arrowup", "w"])) player.y -= dist;
  if (isAnyKeyHeld(["arrowdown", "s"])) player.y += dist;
  if (isAnyKeyHeld(["arrowleft", "a"])) {
    player.x -= dist;
    player.facing = "left";
  }
  if (isAnyKeyHeld(["arrowright", "d"])) {
    player.x += dist;
    player.facing = "right";
  }

  player.x = Math.max(0, Math.min(player.x, STAGE_WIDTH - player.width));
  player.y = Math.max(0, Math.min(player.y, STAGE_HEIGHT - player.height));
}

interface LocalPlayerRenderOptions {
  avatar?: string;
  name?: string;
  seatTimer?: number;
  seatStartTime?: number;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  options?: LocalPlayerRenderOptions,
): void {
  const { x, y, width: w, height: h, character, facing, state } = player;
  const avatar = options?.avatar;
  const name = options?.name ?? "";
  const seatTimer = options?.seatTimer ?? 0;
  const seatStartTime = options?.seatStartTime;
  const currentSeatSeconds = getCurrentSeatSeconds(
    seatTimer,
    seatStartTime,
    state,
  );
  const sprite = character ? getSprite(character) : null;

  ctx.save();

  // Flip horizontally when facing left
  if (facing === "left") {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w / 2), -(y + h / 2));
  }

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    // Slight bob when walking
    const bobY = state === "walking" ? Math.sin(Date.now() / 150) * 1.5 : 0;
    ctx.globalAlpha = state === "sitting" ? 0.85 : 1;
    ctx.drawImage(sprite, x, y + bobY, w, h);
    ctx.globalAlpha = 1;
  } else if (avatar) {
    ctx.font = `${w * 0.55}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(avatar, x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  } else {
    // Fallback box (sprite not loaded)
    ctx.fillStyle = state === "sitting" ? "#facc15" : "#60a5fa";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = state === "sitting" ? "#78350f" : "#1d4ed8";
    ctx.fillRect(x + w * 0.3, y + h * 0.25, w * 0.15, w * 0.15);
    ctx.fillRect(x + w * 0.55, y + h * 0.25, w * 0.15, w * 0.15);
  }

  ctx.restore();

  if (state === "sitting" || seatTimer > 0) {
    drawTimeLabel(
      ctx,
      x + w / 2,
      y - 6,
      name,
      formatTime(currentSeatSeconds),
      state === "sitting",
    );
  }

  // "[E] stand" hint when sitting
  if (state === "sitting") {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("[E] stand", x + w / 2, y - 20);
    ctx.textAlign = "left";
  }
}

function getCurrentSeatSeconds(
  seatTimer: number,
  seatStartTime: number | undefined,
  state: "walking" | "sitting",
): number {
  if (state === "sitting" && seatStartTime && seatStartTime > 0) {
    return seatTimer + Math.floor((Date.now() - seatStartTime) / 1000);
  }
  return seatTimer;
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

  if (name) {
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(name, cx, y + 13);
  }

  ctx.textAlign = "left";
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
