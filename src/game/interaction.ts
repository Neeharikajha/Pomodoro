// src/game/interaction.ts
// Handles sit/stand interaction between the player and benches.
//
// Key design decisions:
//   - "Just pressed" detection: fires once per keypress, not every frame the key is held
//   - Player snaps to bench's sitX/sitY on sit — prevents floating position bugs
//   - Returns whether a state change happened so loop.ts can notify React only when needed

import type { Player, Bench } from "./types";
import { overlaps } from "./collision";
import { isKeyHeld } from "./input";

// ─── Edge detection state ─────────────────────────────────────────────────────
// We track the previous frame's E key state so we only fire on the up→down transition.
let eWasHeld = false;

// ─── Main interaction update ──────────────────────────────────────────────────
// Call this once per frame, after updatePlayer + resolveAllCollisions.
// Returns true if player state changed (so loop.ts knows to notify React).
export function updateInteraction(player: Player, benches: Bench[]): boolean {
  const eIsHeld = isKeyHeld("e");
  const eJustPressed = eIsHeld && !eWasHeld;
  eWasHeld = eIsHeld; // update for next frame

  if (!eJustPressed) return false;

  // ── Player is sitting → stand up ──────────────────────────────────────────
  if (player.state === "sitting") {
    player.state = "walking";
    return true;
  }

  // ── Player is walking → check if near a bench ─────────────────────────────
  const nearbyBench = findNearbyBench(player, benches);
  if (nearbyBench) {
    player.state = "sitting";
    player.x = nearbyBench.sitX; // snap to defined sit position
    player.y = nearbyBench.sitY;
    return true;
  }

  return false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findNearbyBench(player: Player, benches: Bench[]): Bench | null {
  for (const bench of benches) {
    if (overlaps(player, bench.sitZone)) {
      return bench;
    }
  }
  return null;
}
