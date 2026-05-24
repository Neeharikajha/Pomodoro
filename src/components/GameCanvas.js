import { jsx as _jsx } from "react/jsx-runtime";
// GameCanvas.tsx — now accepts netClient + remotePlayersRef
import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/scene";
export default function GameCanvas({ onStateChange, netClient, remotePlayers, }) {
    const canvasRef = useRef(null);
    // Keep a stable ref to the latest remotePlayers map so loop.ts
    // always reads the freshest data without needing to restart
    const remoteRef = useRef(new Map());
    useEffect(() => {
        remoteRef.current = remotePlayers ?? new Map();
    }, [remotePlayers]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        return startLoop(canvas, onStateChange, netClient, () => remoteRef.current);
    }, [onStateChange, netClient]);
    return (_jsx("canvas", { ref: canvasRef, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, className: "rounded border border-stone-700 shadow-2xl" }));
}
