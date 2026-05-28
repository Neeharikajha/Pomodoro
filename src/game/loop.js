import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";
import { drawScene, getSolidRects, CANVAS_WIDTH, CANVAS_HEIGHT } from "./scene";
import { resolveAllCollisions } from "./collision";
import { updateInteraction } from "./interaction";
import { createTimer } from "./timer";
import { drawRemotePlayers } from "./remotePlayer";
import { createNPCs, updateNPCs, drawNPCs } from "./npc";
import { preloadSprites } from "./sprites";
import { BENCHES } from "./world";
const NET_SEND_INTERVAL_MS = 50;
export function startLoop(canvas, onStateChange, netClient, getRemotePlayers, character = "Boy1") {
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Could not get 2D context from canvas");
    preloadSprites();
    const cleanupInput = initInput();
    const player = createPlayer(CANVAS_WIDTH, CANVAS_HEIGHT, character);
    const solids = getSolidRects();
    const timer = createTimer();
    const npcs = createNPCs(CANVAS_WIDTH, CANVAS_HEIGHT);
    let lastTime = performance.now();
    let lastNetSend = 0;
    let animId = 0;
    const tick = (timestamp) => {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        // 1. Move player
        updatePlayer(player, dt);
        // 2. Collide player
        resolveAllCollisions(player, solids);
        // 3. Interact (sit/stand)
        const stateChanged = updateInteraction(player, BENCHES);
        // 4. Timer
        if (stateChanged) {
            player.state === "sitting" ? timer.start() : timer.stop();
        }
        // 5. Update NPCs
        updateNPCs(npcs, dt, CANVAS_WIDTH, CANVAS_HEIGHT, solids);
        // 6. Broadcast
        if (netClient && timestamp - lastNetSend > NET_SEND_INTERVAL_MS) {
            netClient.sendMove(player.x, player.y, player.state, timer.getSeconds());
            lastNetSend = timestamp;
        }
        // 7. Draw
        drawScene(ctx);
        drawNPCs(ctx, npcs);
        if (getRemotePlayers)
            drawRemotePlayers(ctx, getRemotePlayers());
        drawPlayer(ctx, player);
        // 8. Notify React
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
