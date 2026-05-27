// src/game/loop.ts
// Task 3: wires NetClient into the game loop.
// - Broadcasts local player position every frame (throttled to ~20Hz)
// - Receives remote players map, draws them before local player

import type { StateChangeCallback } from "./types";
import type { NetClient, RemotePlayer } from "../net/client";
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

export function startLoop(
  canvas: HTMLCanvasElement,
  onStateChange: StateChangeCallback,
  netClient?: NetClient, // optional — works solo too
  getRemotePlayers?: () => Map<string, RemotePlayer>, // live ref from App
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context from canvas");

  console.log("🎮 Game loop starting");
  console.log("📐 Canvas size:", canvas.width, "x", canvas.height);
  console.log("🌐 NetClient:", netClient ? "connected" : "solo mode");

  const cleanupInput = initInput();
  const player = createPlayer(CANVAS_WIDTH, CANVAS_HEIGHT);
  const solids = getSolidRects();
  const timer = createTimer();

  let lastTime = performance.now();
  let lastNetSend = 0;
  let animId = 0;
  let frameCount = 0;

  const tick = (timestamp: number) => {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    frameCount++;
    if (frameCount === 1) {
      console.log("🎬 First frame rendered");
    }

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
      } else {
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
      const remotePlayers = getRemotePlayers();
      if (frameCount === 1 && remotePlayers.size > 0) {
        console.log("👥 Drawing", remotePlayers.size, "remote players");
      }
      drawRemotePlayers(ctx, remotePlayers);
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
    console.log("🛑 Game loop stopped");
    cancelAnimationFrame(animId);
    cleanupInput();
    timer.stop();
  };
}
