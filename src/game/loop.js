// src/game/loop.ts
// Task 3: wires NetClient into the game loop.
// - Broadcasts local player position every frame (throttled to ~20Hz)
// - Receives remote players map, draws them before local player
import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";
import { drawScene, getSolidRects, CANVAS_WIDTH, CANVAS_HEIGHT } from "./scene";
import { resolveAllCollisions } from "./collision";
import { updateInteraction } from "./interaction";
import { createTimer } from "./timer";
import { drawRemotePlayers } from "./remotePlayer";
import { BENCHES } from "./world";
// Broadcast at ~20 updates/sec — no need to send every 60fps frame
const NET_SEND_INTERVAL_MS = 50;
export function startLoop(canvas, onStateChange, netClient, // optional — works solo too
getRemotePlayers) {
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Could not get 2D context from canvas");
    const cleanupInput = initInput();
    const player = createPlayer(CANVAS_WIDTH, CANVAS_HEIGHT);
    const solids = getSolidRects();
    const timer = createTimer();
    let lastTime = performance.now();
    let lastNetSend = 0;
    let animId = 0;
    const tick = (timestamp) => {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        // 1. Move
        updatePlayer(player, dt);
        // 2. Collide
        resolveAllCollisions(player, solids);
        // 3. Interact
        const stateChanged = updateInteraction(player, BENCHES);
        // 4. Timer transitions
        if (stateChanged) {
            if (player.state === "sitting") {
                timer.start();
            }
            else {
                timer.stop();
            }
        }
        // 5. Broadcast position to server (throttled)
        if (netClient && timestamp - lastNetSend > NET_SEND_INTERVAL_MS) {
            netClient.sendMove(player.x, player.y, player.state);
            lastNetSend = timestamp;
        }
        // 6. Draw — remote players underneath local player
        drawScene(ctx);
        if (getRemotePlayers) {
            drawRemotePlayers(ctx, getRemotePlayers());
        }
        drawPlayer(ctx, player);
        // 7. Notify React
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
