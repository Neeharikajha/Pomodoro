// npc.ts — wandering NPC animals (cat1, cat2, dog1)

import { getSprite } from "./sprites";
import type { Rect } from "./types";

interface NPC {
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: string;
  vx: number;
  vy: number;
  facing: "left" | "right";
  changeTimer: number;
  spawnX: number;
  spawnY: number;
}

const NPC_SPRITES = ["Cat1", "Cat2", "Dog1"];

// Sprites that should NOT be flipped horizontally (artwork looks wrong mirrored)
const NO_FLIP_SPRITES = new Set(["Dog1", "Cat1", "Cat2"]);
const NPC_SIZE = 64; // smaller — tweak freely
const NPC_SPEED = 18; // more noticeable movement
const NPC_ROAM_RADIUS = 100; // larger roam area

// Spread NPCs across different zones of the map
const SPAWN_ZONES = [
  { xMin: 0.15, xMax: 0.4, yMin: 0.3, yMax: 0.6 }, // left-center
  { xMin: 0.4, xMax: 0.65, yMin: 0.5, yMax: 0.8 }, // center-bottom
  { xMin: 0.6, xMax: 0.85, yMin: 0.2, yMax: 0.5 }, // right-center
];

export function createNPCs(canvasWidth: number, canvasHeight: number): NPC[] {
  return NPC_SPRITES.map((sprite, i) => {
    const zone = SPAWN_ZONES[i % SPAWN_ZONES.length];
    const spawnX =
      canvasWidth * (zone.xMin + Math.random() * (zone.xMax - zone.xMin));
    const spawnY =
      canvasHeight * (zone.yMin + Math.random() * (zone.yMax - zone.yMin));
    return {
      x: spawnX,
      y: spawnY,
      width: NPC_SIZE,
      height: NPC_SIZE,
      sprite,
      ...randomVelocity(),
      facing: "right" as const,
      changeTimer: 2 + Math.random() * 3,
      spawnX,
      spawnY,
    };
  });
}

function randomVelocity() {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * NPC_SPEED,
    vy: Math.sin(angle) * NPC_SPEED,
  };
}

export function updateNPCs(
  npcs: NPC[],
  dt: number,
  _canvasWidth: number,
  _canvasHeight: number,
  solids: Rect[],
): void {
  for (const npc of npcs) {
    npc.changeTimer -= dt;

    if (npc.changeTimer <= 0) {
      const { vx, vy } = randomVelocity();
      npc.vx = vx;
      npc.vy = vy;
      npc.changeTimer = 2 + Math.random() * 4;
    }

    const nextX = npc.x + npc.vx * dt;
    const nextY = npc.y + npc.vy * dt;

    // Steer back if too far from spawn
    const dx = nextX - npc.spawnX;
    const dy = nextY - npc.spawnY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > NPC_ROAM_RADIUS) {
      npc.vx = (-dx / dist) * NPC_SPEED;
      npc.vy = (-dy / dist) * NPC_SPEED;
      npc.changeTimer = 1 + Math.random() * 2;
      // don't move this frame — let direction update take effect next frame
      npc.facing = npc.vx >= 0 ? "right" : "left";
      continue;
    }

    // Check collision with solids BEFORE moving
    const nextRect: Rect = {
      x: nextX,
      y: nextY,
      width: npc.width,
      height: npc.height,
    };
    let blocked = false;
    for (const solid of solids) {
      if (rectsOverlap(nextRect, solid)) {
        blocked = true;
        break;
      }
    }

    if (blocked) {
      // Bounce and pick a new direction
      npc.vx *= -1;
      npc.vy *= -1;
      npc.changeTimer = 1 + Math.random() * 2;
    } else {
      npc.x = nextX;
      npc.y = nextY;
    }

    npc.facing = npc.vx >= 0 ? "right" : "left";
  }
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function drawNPCs(ctx: CanvasRenderingContext2D, npcs: NPC[]): void {
  for (const npc of npcs) {
    const sprite = getSprite(npc.sprite);
    const bob = Math.sin(Date.now() / 180 + npc.x) * 2.5;

    ctx.save();

    if (npc.facing === "left" && !NO_FLIP_SPRITES.has(npc.sprite)) {
      ctx.translate(npc.x + npc.width / 2, npc.y + npc.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(npc.x + npc.width / 2), -(npc.y + npc.height / 2));
    }

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, npc.x, npc.y + bob, npc.width, npc.height);
    } else {
      ctx.fillStyle = "#f97316";
      ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
    }

    ctx.restore();
  }
}
