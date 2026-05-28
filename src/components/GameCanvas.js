import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GameCanvas.tsx — now accepts netClient + remotePlayersRef
import { useRef, useEffect } from "react";
import { startLoop } from "../game/loop";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../game/world";
import CafeLeft from "./CafeLeft";
export default function GameCanvas({ onStateChange, netClient, remotePlayers, character = "Boy1", onViewChange, }) {
    const canvasRef = useRef(null);
    const worldRef = useRef(null);
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
        return startLoop(canvas, onStateChange, netClient, () => remoteRef.current, character, (view) => {
            if (worldRef.current) {
                worldRef.current.style.transform = `translate(${-view.x * view.zoom}px, ${-view.y * view.zoom}px) scale(${view.zoom})`;
                worldRef.current.style.transformOrigin = "top left";
            }
            onViewChange?.(view);
        });
    }, [onStateChange, netClient, character, onViewChange]);
    useEffect(() => {
        console.log("🎮 GameCanvas mounted");
        console.log("🗺️ Stage dimensions:", { STAGE_WIDTH, STAGE_HEIGHT });
        console.log("🌐 NetClient:", netClient ? "connected" : "not connected");
        console.log("👥 Remote players count:", remotePlayers?.size || 0);
    }, []); // Only run once on mount
    return (_jsxs("div", { className: "fixed inset-0 w-screen h-screen", children: [_jsx("div", { ref: worldRef, className: "absolute top-0 left-0 z-0", style: { width: STAGE_WIDTH, height: STAGE_HEIGHT }, children: _jsx(CafeLeft, { style: { width: STAGE_WIDTH, height: STAGE_HEIGHT } }) }), _jsx("canvas", { ref: canvasRef, className: "absolute top-0 left-0 w-full h-full pointer-events-auto z-10", style: { backgroundColor: "transparent" } })] }));
}
