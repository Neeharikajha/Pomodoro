import type { Bench, Rect } from "./types";

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;

const WALL_THICKNESS = 32;

export const WALLS: Rect[] = [
  { x: 0, y: 0, width: CANVAS_WIDTH, height: WALL_THICKNESS },
  {
    x: 0,
    y: CANVAS_HEIGHT - WALL_THICKNESS,
    width: CANVAS_WIDTH,
    height: WALL_THICKNESS,
  },
  { x: 0, y: 0, width: WALL_THICKNESS, height: CANVAS_HEIGHT },
  {
    x: CANVAS_WIDTH - WALL_THICKNESS,
    y: 0,
    width: WALL_THICKNESS,
    height: CANVAS_HEIGHT,
  },
];

export const BENCHES: Bench[] = [
  {
    rect: { x: 120, y: 120, width: 196, height: 32 },
    sitZone: { x: 120, y: 156, width: 196, height: 32 },
    sitX: 148,
    sitY: 156,
  },
  {
    rect: { x: 600, y: 120, width: 196, height: 32 },
    sitZone: { x: 600, y: 156, width: 196, height: 32 },
    sitX: 628,
    sitY: 156,
  },
  {
    rect: { x: 360, y: 430, width: 240, height: 32 },
    sitZone: { x: 360, y: 466, width: 240, height: 32 },
    sitX: 420,
    sitY: 466,
  },
];
