// src/game/loop.ts
// Final Step 5 version: wires timer into sit/stand transitions.
// Passes live timer display to React every frame while sitting,
// and once on stand so the HUD freezes on the correct value.
import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";
import { drawScene, getSolidRects, CANVAS_WIDTH, CANVAS_HEIGHT, } from "./scene";
import { resolveAllCollisions } from "./collision";
import { updateInteraction } from "./interaction";
import { createTimer } from "./timer";
import { BENCHES } from "./world";
export function startLoop(canvas, onStateChange) {
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Could not get 2D context from canvas");
    const cleanupInput = initInput();
    const player = createPlayer(CANVAS_WIDTH, CANVAS_HEIGHT);
    const solids = getSolidRects();
    const timer = createTimer();
    let lastTime = performance.now();
    let animId = 0;
    const tick = (timestamp) => {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        // 1. Move
        updatePlayer(player, dt);
        // 2. Collide
        resolveAllCollisions(player, solids);
        // 3. Interact — returns true if state just changed
        const stateChanged = updateInteraction(player, BENCHES);
        // 4. React to state transitions
        if (stateChanged) {
            if (player.state === "sitting") {
                timer.start();
            }
            else {
                timer.stop();
            }
        }
        // 5. Draw
        drawScene(ctx);
        drawPlayer(ctx, player);
        // 6. Notify React:
        //    - Every frame while sitting (so timer ticks live in HUD)
        //    - Once when standing (so HUD freezes on final value)
        if (player.state === "sitting" || stateChanged) {
            onStateChange(player.state, timer.getDisplay());
        }
        animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => {
        cancelAnimationFrame(animId);
        cleanupInput();
        timer.stop();
    };
}
