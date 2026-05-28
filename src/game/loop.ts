import type { StateChangeCallback } from "./types";
import type { CameraView } from "./types";
import type { NetClient, RemotePlayer } from "../net/client";
import { initInput } from "./input";
import { createPlayer, updatePlayer, drawPlayer } from "./player";
import { drawScene, getSolidRects, WORLD_WIDTH, WORLD_HEIGHT } from "./scene";
import { resolveAllCollisions } from "./collision";
import { updateInteraction } from "./interaction";
import { createTimer } from "./timer";
import { drawRemotePlayers } from "./remotePlayer";
import { createNPCs, updateNPCs, drawNPCs } from "./npc";
import { preloadSprites } from "./sprites";
import { BENCHES } from "./world";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./world";

const NET_SEND_INTERVAL_MS = 50;
const BASE_VIEW_WIDTH = 1366;
const BASE_VIEW_HEIGHT = 768;

function getZoom(viewportWidth: number, viewportHeight: number): number {
  const ratio = Math.min(
    viewportWidth / BASE_VIEW_WIDTH,
    viewportHeight / BASE_VIEW_HEIGHT,
  );
  return Math.max(0.8, Math.min(1, ratio));
}

export function startLoop(
  canvas: HTMLCanvasElement,
  onStateChange: StateChangeCallback,
  netClient?: NetClient,
  getRemotePlayers?: () => Map<string, RemotePlayer>,
  character = "Boy1",
  onViewChange?: (view: CameraView) => void,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context from canvas");

  preloadSprites();

  const cleanupInput = initInput();
  const player = createPlayer(STAGE_WIDTH, STAGE_HEIGHT, character);
  const solids = getSolidRects();
  const timer = createTimer();
  const npcs = createNPCs(STAGE_WIDTH, STAGE_HEIGHT);
  const camera: CameraView = {
    x: 0,
    y: 0,
    zoom: 1,
    viewportWidth: canvas.clientWidth || window.innerWidth,
    viewportHeight: canvas.clientHeight || window.innerHeight,
  };

  let lastTime = performance.now();
  let lastNetSend = 0;
  let animId = 0;

  const resizeCanvas = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    camera.viewportWidth = width;
    camera.viewportHeight = height;
    camera.zoom = getZoom(width, height);
  };

  resizeCanvas();

  const tick = (timestamp: number) => {
    resizeCanvas();
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
    updateNPCs(npcs, dt, WORLD_WIDTH, WORLD_HEIGHT, solids);

    // 6. Broadcast
    if (netClient && timestamp - lastNetSend > NET_SEND_INTERVAL_MS) {
      netClient.sendMove(player.x, player.y, player.state, timer.getSeconds());
      lastNetSend = timestamp;
    }

    // 7. Draw
    const visibleWorldWidth = camera.viewportWidth / camera.zoom;
    const visibleWorldHeight = camera.viewportHeight / camera.zoom;
    camera.x = Math.max(
      0,
      Math.min(
        player.x + player.width / 2 - visibleWorldWidth / 2,
        WORLD_WIDTH - visibleWorldWidth,
      ),
    );
    camera.y = Math.max(
      0,
      Math.min(
        player.y + player.height / 2 - visibleWorldHeight / 2,
        WORLD_HEIGHT - visibleWorldHeight,
      ),
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    drawScene(ctx);
    drawNPCs(ctx, npcs);
    if (getRemotePlayers) drawRemotePlayers(ctx, getRemotePlayers());
    drawPlayer(ctx, player);
    ctx.restore();
    onViewChange?.(camera);

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
