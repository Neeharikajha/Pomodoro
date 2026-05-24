// src/components/GameCanvas.tsx
// Updated: canvas width/height now pulled from scene constants
// so there's a single source of truth for canvas dimensions.

import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/scene";
import type { StateChangeCallback } from "../game/types";

interface Props {
  onStateChange: StateChangeCallback;
}

export default function GameCanvas({ onStateChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startLoop(canvas, onStateChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded border border-stone-700 shadow-2xl"
    />
  );
}
