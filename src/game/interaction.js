// src/game/interaction.ts
// Handles sit/stand interaction between the player and benches.
//
// Key design decisions:
//   - "Just pressed" detection: fires once per keypress, not every frame the key is held
//   - Player snaps to bench's sitX/sitY on sit — prevents floating position bugs
//   - Returns whether a state change happened so loop.ts can notify React only when needed
import { overlaps } from "./collision";
import { isKeyHeld } from "./input";
// ─── Edge detection state ─────────────────────────────────────────────────────
// We track the previous frame's E key state so we only fire on the up→down transition.
let eWasHeld = false;
// ─── Main interaction update ──────────────────────────────────────────────────
// Call this once per frame, after updatePlayer + resolveAllCollisions.
// Returns true if player state changed (so loop.ts knows to notify React).
export function updateInteraction(player, benches) {
    const eIsHeld = isKeyHeld("e");
    const eJustPressed = eIsHeld && !eWasHeld;
    eWasHeld = eIsHeld;
    if (!eJustPressed)
        return false;
    console.log("🎹 E pressed! Player state:", player.state, "at", Math.round(player.x), Math.round(player.y));
    console.log("🛋️ Checking", benches.length, "benches");
    if (player.state === "sitting") {
        player.state = "walking";
        console.log("🚶 Standing up");
        return true;
    }
    const nearbyBench = findNearbyBench(player, benches);
    if (nearbyBench) {
        player.state = "sitting";
        player.x = nearbyBench.sitX;
        player.y = nearbyBench.sitY;
        console.log("🪑 Sitting at", nearbyBench.sitX, nearbyBench.sitY);
        return true;
    }
    console.log("❌ No bench nearby. Player rect:", {
        x: player.x,
        y: player.y,
        w: player.width,
        h: player.height,
    });
    benches.forEach((b, i) => {
        console.log(`  bench[${i}] sitZone:`, b.sitZone);
    });
    return false;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function findNearbyBench(player, benches) {
    for (const bench of benches) {
        if (overlaps(player, bench.sitZone)) {
            return bench;
        }
    }
    return null;
}
