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
// Note: Red Sofas and Chairs are now in BENCHES (sittable)
export const LEFT_BOTTOM_FURNITURE: Rect[] = [
  // Green Plant 1 - center 20%
  {
    x: 140 + 30 * 0.4,
    y: CANVAS_HEIGHT - 180 + 30 * 0.4,
    width: 30 * 0.2,
    height: 30 * 0.2,
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
  // Table (between chairs) - center 20%
  {
    x: 290 + 50 * 0.4,
    y: CANVAS_HEIGHT - 460 + 50 * 0.4,
    width: 50 * 0.2,
    height: 50 * 0.2,
  },
];

export const BENCHES: Bench[] = [
  // Red Sofas - LeftBottom (sittable)
  // RedSofa SVG: 32x64, scaled 1.5x = 48x96

  // Left Red Sofa (vertical, at left: 80px, bottom: 70px)
  {
    rect: { x: 80, y: CANVAS_HEIGHT - 70 - 96, width: 48, height: 96 },
    sitZone: { x: 80, y: CANVAS_HEIGHT - 70 - 96, width: 48, height: 96 },
    sitX: 104,
    sitY: CANVAS_HEIGHT - 70 - 48,
  },

  // Bottom Red Sofa 1 (horizontal, rotated -90deg, at left: 150px, bottom: 1px)
  // When rotated -90deg, width/height swap: 96x48
  {
    rect: { x: 150, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitZone: { x: 150, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitX: 198,
    sitY: CANVAS_HEIGHT - 25,
  },

  // Bottom Red Sofa 2 (horizontal, rotated -90deg, at left: 240px, bottom: 1px)
  {
    rect: { x: 240, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitZone: { x: 240, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitX: 288,
    sitY: CANVAS_HEIGHT - 25,
  },

  // Chairs - LeftBottom (sittable)
  // Chair SVG: 37x37, scaled 1.4x = 52x52

  // Chair 1 (at left: 80px, bottom: 380px)
  {
    rect: { x: 80, y: CANVAS_HEIGHT - 380 - 52, width: 52, height: 52 },
    sitZone: { x: 80, y: CANVAS_HEIGHT - 380 - 52, width: 52, height: 52 },
    sitX: 106,
    sitY: CANVAS_HEIGHT - 380 - 26,
  },

  // Chair 2 (at left: 200px, bottom: 380px)
  {
    rect: { x: 200, y: CANVAS_HEIGHT - 380 - 52, width: 52, height: 52 },
    sitZone: { x: 200, y: CANVAS_HEIGHT - 380 - 52, width: 52, height: 52 },
    sitX: 226,
    sitY: CANVAS_HEIGHT - 380 - 26,
  },
];
