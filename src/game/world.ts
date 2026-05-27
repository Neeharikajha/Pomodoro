import type { Bench, Rect } from "./types";

export const CANVAS_WIDTH = window.innerWidth;
export const CANVAS_HEIGHT = window.innerHeight;

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

// Furniture collision boxes - CafeLeft (top section)
// Using 40% padding from each side (only center 20% is solid)
export const FURNITURE: Rect[] = [
  // Fridge - center 20%
  { x: 0 + 51 * 0.4, y: 0 + 81 * 0.4, width: 51 * 0.2, height: 81 * 0.2 },
  // FridgeSide - center 20%
  { x: 51 + 111 * 0.4, y: 0 + 51 * 0.4, width: 111 * 0.2, height: 51 * 0.2 },
  // FridgeSideTwo - center 20%
  { x: 162 + 69 * 0.4, y: 0 + 59 * 0.4, width: 69 * 0.2, height: 59 * 0.2 },
  // Oven - center 20%
  { x: 231 + 37 * 0.4, y: 0 + 59 * 0.4, width: 37 * 0.2, height: 59 * 0.2 },
  // CommonSide (top) - center 20%
  { x: 268 + 39 * 0.4, y: 0 + 121 * 0.4, width: 39 * 0.2, height: 121 * 0.2 },
  // Drawer 1 - center 20%
  { x: 0 + 127 * 0.4, y: 101 + 55 * 0.4, width: 127 * 0.2, height: 55 * 0.2 },
  // Drawer 2 - center 20%
  { x: 127 + 127 * 0.4, y: 101 + 55 * 0.4, width: 127 * 0.2, height: 55 * 0.2 },
  // Drawer 3 - center 20%
  { x: 254 + 127 * 0.4, y: 101 + 55 * 0.4, width: 127 * 0.2, height: 55 * 0.2 },
];

// LeftBottom furniture collision boxes - center 20% only
export const LEFT_BOTTOM_FURNITURE: Rect[] = [
  // Left Red Sofa - center 20%
  {
    x: 100 + 60 * 0.4,
    y: CANVAS_HEIGHT - 230 + 80 * 0.4,
    width: 60 * 0.2,
    height: 80 * 0.2,
  },
  // Green Plant 1 - center 20%
  {
    x: 140 + 30 * 0.4,
    y: CANVAS_HEIGHT - 180 + 30 * 0.4,
    width: 30 * 0.2,
    height: 30 * 0.2,
  },
  // Bottom Red Sofa 1 - center 20%
  {
    x: 180 + 80 * 0.4,
    y: CANVAS_HEIGHT - 130 + 60 * 0.4,
    width: 80 * 0.2,
    height: 60 * 0.2,
  },
  // Bottom Red Sofa 2 - center 20%
  {
    x: 260 + 80 * 0.4,
    y: CANVAS_HEIGHT - 130 + 60 * 0.4,
    width: 80 * 0.2,
    height: 60 * 0.2,
  },
  // Green Plant 2 - center 20%
  {
    x: 340 + 30 * 0.4,
    y: CANVAS_HEIGHT - 130 + 30 * 0.4,
    width: 30 * 0.2,
    height: 30 * 0.2,
  },
  // CommonSide (bottom) - center 20%
  {
    x: 380 + 39 * 0.4,
    y: CANVAS_HEIGHT - 171 + 121 * 0.4,
    width: 39 * 0.2,
    height: 121 * 0.2,
  },
  // Red Table (center) - center 20%
  {
    x: 200 + 80 * 0.4,
    y: CANVAS_HEIGHT - 200 + 60 * 0.4,
    width: 80 * 0.2,
    height: 60 * 0.2,
  },
  // Vending Machine - center 20%
  {
    x: 100 + 80 * 0.4,
    y: CANVAS_HEIGHT - 360 + 100 * 0.4,
    width: 80 * 0.2,
    height: 100 * 0.2,
  },
  // Green Plant Big 1 - center 20%
  {
    x: 200 + 50 * 0.4,
    y: CANVAS_HEIGHT - 360 + 60 * 0.4,
    width: 50 * 0.2,
    height: 60 * 0.2,
  },
  // Green Plant Big 2 - center 20%
  {
    x: 260 + 50 * 0.4,
    y: CANVAS_HEIGHT - 360 + 60 * 0.4,
    width: 50 * 0.2,
    height: 60 * 0.2,
  },
  // CommonSide 2 - center 20%
  {
    x: 320 + 39 * 0.4,
    y: CANVAS_HEIGHT - 401 + 121 * 0.4,
    width: 39 * 0.2,
    height: 121 * 0.2,
  },
  // Chair 1 - center 20%
  {
    x: 260 + 30 * 0.4,
    y: CANVAS_HEIGHT - 460 + 30 * 0.4,
    width: 30 * 0.2,
    height: 30 * 0.2,
  },
  // Table (between chairs) - center 20%
  {
    x: 290 + 50 * 0.4,
    y: CANVAS_HEIGHT - 460 + 50 * 0.4,
    width: 50 * 0.2,
    height: 50 * 0.2,
  },
  // Chair 2 - center 20%
  {
    x: 340 + 30 * 0.4,
    y: CANVAS_HEIGHT - 460 + 30 * 0.4,
    width: 30 * 0.2,
    height: 30 * 0.2,
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
