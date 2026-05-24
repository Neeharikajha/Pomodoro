// src/App.tsx
// Root layout. Owns the shared state (timerDisplay, playerState)
// and passes them down to HUD and GameCanvas via props/callbacks.

import { useState, useCallback } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import type { PlayerState, StateChangeCallback } from "./game/types";

export default function App() {
  const [timerDisplay, setTimerDisplay] = useState<string>("00:00");
  const [playerState, setPlayerState] = useState<PlayerState>("walking");

  // useCallback so the reference is stable — avoids re-triggering useEffect in GameCanvas
  const handleStateChange = useCallback<StateChangeCallback>(
    (state, display) => {
      setPlayerState(state);
      setTimerDisplay(display);
    },
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 gap-5 p-6">
      {/* Title */}
      <h1 className="text-stone-500 text-sm font-mono uppercase tracking-widest">
        ☕ café sim — mvp
      </h1>

      {/* HUD */}
      <HUD time={timerDisplay} status={playerState} />

      {/* Game */}
      <GameCanvas onStateChange={handleStateChange} />

      {/* Controls reminder */}
      <p className="text-stone-600 text-xs font-mono">
        WASD / arrow keys to move &nbsp;·&nbsp; E to sit / stand
      </p>
    </div>
  );
}
