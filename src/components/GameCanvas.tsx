// GameCanvas.tsx — now accepts netClient + remotePlayersRef

import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../game/world";
import type { StateChangeCallback } from "../game/types";
import type { CameraView } from "../game/types";
import type { NetClient, RemotePlayer } from "../net/client";
import CafeLeft from "./CafeLeft";

interface Props {
  onStateChange: StateChangeCallback;
  netClient?: NetClient;
  remotePlayers?: Map<string, RemotePlayer>;
  character?: string;
  onViewChange?: (view: CameraView) => void;
}

export default function GameCanvas({
  onStateChange,
  netClient,
  remotePlayers,
  character = "Boy1",
  onViewChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // Keep a stable ref to the latest remotePlayers map so loop.ts
  // always reads the freshest data without needing to restart
  const remoteRef = useRef<Map<string, RemotePlayer>>(new Map());
  useEffect(() => {
    remoteRef.current = remotePlayers ?? new Map();
  }, [remotePlayers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startLoop(
      canvas,
      onStateChange,
      netClient,
      () => remoteRef.current,
      character,
      (view) => {
        if (worldRef.current) {
          worldRef.current.style.transform = `translate(${-view.x * view.zoom}px, ${-view.y * view.zoom}px) scale(${view.zoom})`;
          worldRef.current.style.transformOrigin = "top left";
        }
        onViewChange?.(view);
      },
    );
  }, [onStateChange, netClient, character, onViewChange]);

  useEffect(() => {
    console.log("GAMECANVAS MOUNTED");
    console.log("Stage dimensions:", { STAGE_WIDTH, STAGE_HEIGHT });
    console.log("NetClient:", netClient ? "connected" : "not connected");
    console.log("Remote players count:", remotePlayers?.size || 0);
    console.log("Canvas container classes applied");
    console.log("Canvas should be centered now");
  }, []); // Only run once on mount

  console.log("GAMECANVAS RENDERING - dimensions:", STAGE_WIDTH, "x", STAGE_HEIGHT);

  return (
    <div
      className="relative"
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        boxShadow: '0 10px 50px rgba(0,0,0,0.3)'
      }}
    >
      <div
        ref={worldRef}
        className="absolute top-0 left-0 z-0"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
      >
        <CafeLeft style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }} />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto z-10"
        style={{ backgroundColor: "transparent", width: STAGE_WIDTH, height: STAGE_HEIGHT }}
      />
    </div>
  );
}
