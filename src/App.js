import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
// Root layout. Owns the shared state (timerDisplay, playerState)
// and passes them down to HUD and GameCanvas via props/callbacks.
import { useState, useCallback } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
export default function App() {
    const [timerDisplay, setTimerDisplay] = useState("00:00");
    const [playerState, setPlayerState] = useState("walking");
    // useCallback so the reference is stable — avoids re-triggering useEffect in GameCanvas
    const handleStateChange = useCallback((state, display) => {
        setPlayerState(state);
        setTimerDisplay(display);
    }, []);
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-neutral-950 gap-5 p-6", children: [_jsx("h1", { className: "text-stone-500 text-sm font-mono uppercase tracking-widest", children: "\u2615 caf\u00E9 sim \u2014 mvp" }), _jsx(HUD, { time: timerDisplay, status: playerState }), _jsx(GameCanvas, { onStateChange: handleStateChange }), _jsx("p", { className: "text-stone-600 text-xs font-mono", children: "WASD / arrow keys to move \u00A0\u00B7\u00A0 E to sit / stand" })] }));
}
