// scene.ts

import { WALLS, BENCHES, CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/world";
import type { Bench, Rect } from "./types";

// 🎨 Draw Floor
function drawFloor(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#292524"; // dark floor
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// 🟥 Draw Walls (FIXED: high contrast)
function drawWalls(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#a8a29e"; // light gray (VISIBLE)

  for (const wall of WALLS) {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  }
}

// 🟧 Draw Benches + Sit Zones (FIXED)
function drawBenches(ctx: CanvasRenderingContext2D): void {
  for (const bench of BENCHES) {
    const r = bench.rect;

    // 🟧 Bench body
    ctx.fillStyle = "#ea580c"; // bright orange (VISIBLE)
    ctx.fillRect(r.x, r.y, r.width, r.height);

    // 🟡 Sit zone (dashed outline)
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.strokeRect(r.x - 4, r.y - 4, r.width + 8, r.height + 8);

    ctx.setLineDash([]); // reset
  }
}

// 🎬 Main Scene Renderer
export function drawScene(ctx: CanvasRenderingContext2D): void {
  console.log("DRAWING SCENE"); // debug

  drawFloor(ctx);
  drawWalls(ctx);
  drawBenches(ctx);
}

export function getSolidRects(): Rect[] {
  return [...WALLS, ...BENCHES.map((bench: Bench) => bench.rect)];
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
