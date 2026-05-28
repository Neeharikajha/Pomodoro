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
  localAvatar?: string;
  localName?: string;
  localSeatTimer?: number;
  localSeatStartTime?: number;
  onViewChange?: (view: CameraView) => void;
}

export default function GameCanvas({
  onStateChange,
  netClient,
  remotePlayers,
  character = "Boy1",
  localAvatar,
  localName,
  localSeatTimer,
  localSeatStartTime,
  onViewChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const localMetaRef = useRef({
    avatar: localAvatar,
    name: localName,
    seatTimer: localSeatTimer,
    seatStartTime: localSeatStartTime,
  });

  // Keep a stable ref to the latest remotePlayers map so loop.ts
  // always reads the freshest data without needing to restart
  const remoteRef = useRef<Map<string, RemotePlayer>>(new Map());
  useEffect(() => {
    remoteRef.current = remotePlayers ?? new Map();
  }, [remotePlayers]);

  useEffect(() => {
    localMetaRef.current = {
      avatar: localAvatar,
      name: localName,
      seatTimer: localSeatTimer,
      seatStartTime: localSeatStartTime,
    };
  }, [localAvatar, localName, localSeatTimer, localSeatStartTime]);

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
      () => localMetaRef.current,
    );
  }, [onStateChange, netClient, character, onViewChange]);


  return (
    <div
      className="relative"
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        boxShadow: "0 10px 50px rgba(0,0,0,0.3)",
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
        style={{
          backgroundColor: "transparent",
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
        }}
      />
    </div>
  );
}
