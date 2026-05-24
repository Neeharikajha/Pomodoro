// src/game/loop.ts
// Updated for Step 3: wires in scene drawing + collision resolution.
// Order every frame: update → resolve collisions → draw scene → draw player.
import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";
import { drawScene, getSolidRects, CANVAS_WIDTH, CANVAS_HEIGHT } from "./scene";
import { resolveAllCollisions } from "./collision";
export function startLoop(canvas, onStateChange) {
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Could not get 2D context from canvas");
    const cleanupInput = initInput();
    const player = createPlayer(CANVAS_WIDTH, CANVAS_HEIGHT);
    const solids = getSolidRects(); // computed once — static world
    let lastTime = performance.now();
    let animId = 0;
    const tick = (timestamp) => {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        // 1. Move player based on input
        updatePlayer(player, dt);
        // 2. Push player out of any walls or benches
        resolveAllCollisions(player, solids);
        // 3. Draw scene (floor → walls → benches)
        drawScene(ctx);
        // 4. Draw player on top
        drawPlayer(ctx, player);
        // 5. Notify React (state changes will matter from Step 4 onward)
        onStateChange(player.state, "00:00");
        animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => {
        cancelAnimationFrame(animId);
        cleanupInput();
    };
}
