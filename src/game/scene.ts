// scene.ts

import { WALLS, BENCHES, CANVAS_WIDTH, CANVAS_HEIGHT } from "./world";
import type { Bench, Rect } from "./types";

// 🎨 Draw Floor
function drawFloor(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#292524"; // dark floor
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // subtle tile grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 6]);

  const step = 48;
  for (let x = step; x < ctx.canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }
  for (let y = step; y < ctx.canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }

  ctx.setLineDash([]);}

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
    const zone = bench.sitZone;

    // 🟧 Bench body
    ctx.fillStyle = "#ea580c"; // bright orange (VISIBLE)
    ctx.fillRect(r.x, r.y, r.width, r.height);

    // 🟡 Sit zone (dashed outline)
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
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
