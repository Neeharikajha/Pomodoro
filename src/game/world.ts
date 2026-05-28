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

// ─── RightAll collision + bench data ─────────────────────────────────────────
// Helper: convert CSS right/top to canvas x
const rx = (right: number, w: number) => CANVAS_WIDTH - right - w;
// Helper: convert CSS right/bottom to canvas x
const rxb = (right: number, w: number) => CANVAS_WIDTH - right - w;
// Helper: convert CSS bottom to canvas y
const by = (bottom: number, h: number) => CANVAS_HEIGHT - bottom - h;

// center-20% collision box from a full rect
const c20 = (x: number, y: number, w: number, h: number): Rect => ({
  x: x + w * 0.4,
  y: y + h * 0.4,
  width: w * 0.2,
  height: h * 0.2,
});

// RightAll scaled sizes (scale 1.5)
// Pond:           235*1.5=352 x 65*1.5=97   (top right, right:100, top:10)
// WoodenTable:    64*1.5=96  x 32*1.5=48    (top:160)
// VendingMachine: 80*1.5=120 x 100*1.5=150  (right:75, top:300)
// GreenPlantBig:  50*1.5=75  x 60*1.5=90
// GreenPlants:    ~40*1.5=60 x ~40*1.5=60
// Table:          50*1.5=75  x 50*1.5=75    (scaled 1.5*1.2=1.8 → 90x90)
// Chair:          37*1.5=55  x 37*1.5=55    (scaled 1.5*1.2=1.8 → 66x66)
// CommonSide:     39*1.5=58  x 121*1.5=181

const RIGHT = 20;
const S = 1.5;

// Precompute positions matching RightAll.tsx exactly
const pond = { x: rx(RIGHT + 80, 352), y: 10, w: 352, h: 97 };
const wt1 = {
  x: rx(RIGHT + Math.round(83 * S) + 300, 96),
  y: 160,
  w: 96,
  h: 48,
};
const wt2 = { x: rx(RIGHT + 150, 96), y: 160, w: 96, h: 48 };
const vend = { x: rx(RIGHT + 55, 120), y: 300, w: 120, h: 150 };
const plant1 = { x: rx(RIGHT + 50, 75), y: 190, w: 75, h: 90 };
const plant2 = { x: rx(RIGHT + 104 + 10 + 70, 75), y: 340, w: 75, h: 90 };
const plant3 = { x: rx(RIGHT + 215 + 320 + 140, 60), y: 270, w: 60, h: 60 };
const plant4 = { x: rx(RIGHT + 90 + 210, 60), y: 160, w: 60, h: 60 };
// Tables (scale 1.5*1.2 = 1.8 → 90x90)
const table1 = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 280, 90),
  y: 280,
  w: 90,
  h: 90,
};
const table2 = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 20 + 90, 90),
  y: 450,
  w: 90,
  h: 90,
};
// Chairs (scale 1.5*1.2 = 1.8 → 66x66)
const chairT1a = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 20 + 380, 66),
  y: 280,
  w: 66,
  h: 66,
};
const chairT1b = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 20 + 220, 66),
  y: 280,
  w: 66,
  h: 66,
};
const chairT2a = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 20 + 90 + 98, 66),
  y: 440,
  w: 66,
  h: 66,
};
const chairT2b = {
  x: rx(RIGHT + 104 + 8 + 4 * 68 + 20 + 68, 66),
  y: 440,
  w: 66,
  h: 66,
};
// Bottom right group (scale 1.5 → chair 55x55, table 75x75)
const botChair1 = { x: rxb(RIGHT + 110, 55), y: by(60, 55), w: 55, h: 55 };
const botChair2 = { x: rxb(RIGHT + 200, 55), y: by(60, 55), w: 55, h: 55 };
// CommonSides (scale 1.5 → 58x181)
const csFront = {
  x: rx(RIGHT + 280, 58),
  y: by(40 - 157 - 10 + 120, 181),
  w: 58,
  h: 181,
};
const csLeft = { x: rx(RIGHT + 240, 58), y: by(220, 181), w: 58, h: 181 };

export const RIGHT_ALL_FURNITURE: Rect[] = [
  c20(pond.x, pond.y, pond.w, pond.h),
  c20(wt1.x, wt1.y, wt1.w, wt1.h),
  c20(wt2.x, wt2.y, wt2.w, wt2.h),
  c20(vend.x, vend.y, vend.w, vend.h),
  c20(plant1.x, plant1.y, plant1.w, plant1.h),
  c20(plant2.x, plant2.y, plant2.w, plant2.h),
  c20(plant3.x, plant3.y, plant3.w, plant3.h),
  c20(plant4.x, plant4.y, plant4.w, plant4.h),
  c20(table1.x, table1.y, table1.w, table1.h),
  c20(table2.x, table2.y, table2.w, table2.h),
  c20(csFront.x, csFront.y, csFront.w, csFront.h),
  c20(csLeft.x, csLeft.y, csLeft.w, csLeft.h),
];

// Chairs and WoodenTables are sittable — added to BENCHES below
// (not in RIGHT_ALL_FURNITURE)

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
  {
    rect: { x: 150, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitZone: { x: 150, y: CANVAS_HEIGHT - 1 - 48 - 40, width: 96, height: 88 },
    sitX: 198,
    sitY: CANVAS_HEIGHT - 1 - 48 - 48, // sit above the sofa
  },

  // Bottom Red Sofa 2 (horizontal, rotated -90deg, at left: 240px, bottom: 1px)
  {
    rect: { x: 240, y: CANVAS_HEIGHT - 1 - 48, width: 96, height: 48 },
    sitZone: { x: 240, y: CANVAS_HEIGHT - 1 - 48 - 40, width: 96, height: 88 },
    sitX: 288,
    sitY: CANVAS_HEIGHT - 1 - 48 - 48, // sit above the sofa
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

  // ── RightAll chairs (sittable) ────────────────────────────────────────────
  // Chair above Table 1
  {
    rect: c20(chairT1a.x, chairT1a.y, chairT1a.w, chairT1a.h),
    sitZone: {
      x: chairT1a.x,
      y: chairT1a.y,
      width: chairT1a.w,
      height: chairT1a.h,
    },
    sitX: chairT1a.x + chairT1a.w / 2 - 16,
    sitY: chairT1a.y + chairT1a.h / 2 - 16,
  },
  // Chair below Table 1
  {
    rect: c20(chairT1b.x, chairT1b.y, chairT1b.w, chairT1b.h),
    sitZone: {
      x: chairT1b.x,
      y: chairT1b.y,
      width: chairT1b.w,
      height: chairT1b.h,
    },
    sitX: chairT1b.x + chairT1b.w / 2 - 16,
    sitY: chairT1b.y + chairT1b.h / 2 - 16,
  },
  // Chair above Table 2
  {
    rect: c20(chairT2a.x, chairT2a.y, chairT2a.w, chairT2a.h),
    sitZone: {
      x: chairT2a.x,
      y: chairT2a.y,
      width: chairT2a.w,
      height: chairT2a.h,
    },
    sitX: chairT2a.x + chairT2a.w / 2 - 16,
    sitY: chairT2a.y + chairT2a.h / 2 - 16,
  },
  // Chair below Table 2
  {
    rect: c20(chairT2b.x, chairT2b.y, chairT2b.w, chairT2b.h),
    sitZone: {
      x: chairT2b.x,
      y: chairT2b.y,
      width: chairT2b.w,
      height: chairT2b.h,
    },
    sitX: chairT2b.x + chairT2b.w / 2 - 16,
    sitY: chairT2b.y + chairT2b.h / 2 - 16,
  },
  // Bottom Chair 1
  {
    rect: c20(botChair1.x, botChair1.y, botChair1.w, botChair1.h),
    sitZone: {
      x: botChair1.x,
      y: botChair1.y,
      width: botChair1.w,
      height: botChair1.h,
    },
    sitX: botChair1.x + botChair1.w / 2 - 16,
    sitY: botChair1.y + botChair1.h / 2 - 16,
  },
  // Bottom Chair 2
  {
    rect: c20(botChair2.x, botChair2.y, botChair2.w, botChair2.h),
    sitZone: {
      x: botChair2.x,
      y: botChair2.y,
      width: botChair2.w,
      height: botChair2.h,
    },
    sitX: botChair2.x + botChair2.w / 2 - 16,
    sitY: botChair2.y + botChair2.h / 2 - 16,
  },

  // ── RightAll wooden tables (sittable) ─────────────────────────────────────
  // Wooden Table 1
  {
    rect: c20(wt1.x, wt1.y, wt1.w, wt1.h),
    sitZone: { x: wt1.x, y: wt1.y, width: wt1.w, height: wt1.h },
    sitX: wt1.x + wt1.w / 2 - 16,
    sitY: wt1.y + wt1.h / 2 - 16,
  },
  // Wooden Table 2
  {
    rect: c20(wt2.x, wt2.y, wt2.w, wt2.h),
    sitZone: { x: wt2.x, y: wt2.y, width: wt2.w, height: wt2.h },
    sitX: wt2.x + wt2.w / 2 - 16,
    sitY: wt2.y + wt2.h / 2 - 16,
  },
];
