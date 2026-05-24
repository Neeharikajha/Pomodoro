// src/game/collision.ts
// Pure collision math. No React, no canvas, no game state.
// Two functions: overlap check + resolve (push player out of a rect).

import type { Rect } from "./types";

// ─── AABB overlap ─────────────────────────────────────────────────────────────
// Returns true if rect A and rect B intersect.
export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ─── Resolve ──────────────────────────────────────────────────────────────────
// Pushes `moving` rect out of `solid` rect using minimum displacement.
// Mutates moving.x / moving.y directly.
export function resolveCollision(moving: Rect, solid: Rect): void {
  if (!overlaps(moving, solid)) return;

  // How much overlap on each axis
  const overlapLeft = moving.x + moving.width - solid.x;
  const overlapRight = solid.x + solid.width - moving.x;
  const overlapTop = moving.y + moving.height - solid.y;
  const overlapBottom = solid.y + solid.height - moving.y;

  // Push out along the axis with the smallest overlap (minimum displacement)
  const minX = Math.min(overlapLeft, overlapRight);
  const minY = Math.min(overlapTop, overlapBottom);

  if (minX < minY) {
    // Resolve horizontally
    if (overlapLeft < overlapRight) {
      moving.x -= overlapLeft; // push left
    } else {
      moving.x += overlapRight; // push right
    }
  } else {
    // Resolve vertically
    if (overlapTop < overlapBottom) {
      moving.y -= overlapTop; // push up
    } else {
      moving.y += overlapBottom; // push down
    }
  }
}

// ─── Resolve against all solids ───────────────────────────────────────────────
// Runs resolveCollision for every solid rect. Call this after updatePlayer.
export function resolveAllCollisions(moving: Rect, solids: Rect[]): void {
  for (const solid of solids) {
    resolveCollision(moving, solid);
  }
}
