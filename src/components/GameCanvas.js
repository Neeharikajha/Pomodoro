import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GameCanvas.tsx — now accepts netClient + remotePlayersRef
import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/scene";
import CafeLeft from "./CafeLeft";
export default function GameCanvas({ onStateChange, netClient, remotePlayers, character = "Boy1", }) {
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
        return startLoop(canvas, onStateChange, netClient, () => remoteRef.current, character);
    }, [onStateChange, netClient, character]);
    useEffect(() => {
        console.log("🎮 GameCanvas mounted");
        console.log("📐 Canvas dimensions:", { CANVAS_WIDTH, CANVAS_HEIGHT });
        console.log("🌐 NetClient:", netClient ? "connected" : "not connected");
        console.log("👥 Remote players count:", remotePlayers?.size || 0);
    }, []); // Only run once on mount
    return (_jsxs("div", { className: "fixed inset-0 w-screen h-screen", children: [_jsx("canvas", { ref: canvasRef, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, className: "absolute top-0 left-0 w-full h-full pointer-events-auto z-10", style: { backgroundColor: "transparent" } }), _jsx(CafeLeft, {})] }));
}
