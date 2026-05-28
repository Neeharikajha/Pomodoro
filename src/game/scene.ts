// scene.ts

import {
  WALLS,
  BENCHES,
  FURNITURE,
  LEFT_BOTTOM_FURNITURE,
  RIGHT_ALL_FURNITURE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from "./world";
import type { Rect } from "./types";

// 🟧 Draw Benches — small dot indicator only
function drawBenches(ctx: CanvasRenderingContext2D): void {
  for (const bench of BENCHES) {
    const zone = bench.sitZone;
    const cx = zone.x + zone.width / 2;
    const cy = zone.y + zone.height / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fill();
  }
}

// 🎬 Main Scene Renderer
export function drawScene(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawBenches(ctx);
}

export function getSolidRects(): Rect[] {
  return [
    ...WALLS,
    ...FURNITURE,
    ...LEFT_BOTTOM_FURNITURE,
    ...RIGHT_ALL_FURNITURE,
    // BENCHES excluded — player must walk into sitZone to trigger sit
  ];
}

export { WORLD_WIDTH, WORLD_HEIGHT };
