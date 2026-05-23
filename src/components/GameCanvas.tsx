import { useEffect, useRef } from "react";
import { startLoop } from "../game/loop";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = startLoop(canvas, () => {});

    return cleanup;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-neutral-700"
    />
  );
}
