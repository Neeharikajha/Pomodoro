// GameCanvas.tsx — now accepts netClient + remotePlayersRef

import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/scene";
import type { StateChangeCallback } from "../game/types";
import type { NetClient, RemotePlayer } from "../net/client";
import CafeLeft from "./CafeLeft";

interface Props {
  onStateChange: StateChangeCallback;
  netClient?: NetClient;
  remotePlayers?: Map<string, RemotePlayer>;
}

export default function GameCanvas({
  onStateChange,
  netClient,
  remotePlayers,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep a stable ref to the latest remotePlayers map so loop.ts
  // always reads the freshest data without needing to restart
  const remoteRef = useRef<Map<string, RemotePlayer>>(new Map());
  useEffect(() => {
    remoteRef.current = remotePlayers ?? new Map();
  }, [remotePlayers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startLoop(canvas, onStateChange, netClient, () => remoteRef.current);
  }, [onStateChange, netClient]);

  useEffect(() => {
    console.log("🎮 GameCanvas mounted");
    console.log("📐 Canvas dimensions:", { CANVAS_WIDTH, CANVAS_HEIGHT });
    console.log("🌐 NetClient:", netClient ? "connected" : "not connected");
    console.log("👥 Remote players count:", remotePlayers?.size || 0);
  }, [netClient, remotePlayers]);

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <CafeLeft />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        style={{ backgroundColor: "transparent" }}
      />
    </div>
  );
}
