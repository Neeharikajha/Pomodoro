import { useState, useCallback, useEffect } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import RoomLobby from "./components/RoomLobby";
import type { PlayerState } from "./game/types";
import type { LocalPlayer, RoomId, LobbyState } from "./net/types";
import {
  createNetClient,
  type NetClient,
  type RemotePlayer,
} from "./net/client";

export default function App() {
  const [timerDisplay, setTimerDisplay] = useState<string>("00:00");
  const [playerState, setPlayerState] = useState<PlayerState>("walking");
  const [lobby, setLobby] = useState<LobbyState>({
    phase: "lobby",
    localPlayer: null,
    roomId: null,
    mode: null,
  });
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(
    new Map(),
  );
  const [resolvedRoomId, setResolvedRoomId] = useState<RoomId | null>(null);
  const [netClient, setNetClient] = useState<NetClient | null>(null);

  const handleStateChange = useCallback(
    (state: PlayerState, display: string) => {
      setPlayerState(state);
      setTimerDisplay(display);
    },
    [],
  );

  function handleEnter(
    player: LocalPlayer,
    roomId: RoomId,
    mode: "create" | "join" | "random",
  ) {
    const client = createNetClient(player, roomId, mode, (players) =>
      setRemotePlayers(new Map(players)),
    );
    setNetClient(client);
    setLobby({ phase: "game", localPlayer: player, roomId, mode });
  }

  useEffect(() => {
    if (!netClient) return;

    const interval = setInterval(() => {
      const id = netClient.getRoomId();
      if (id !== "__random__") {
        setResolvedRoomId(id);
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [netClient]);

  function handleLeave() {
    netClient?.disconnect();
    setLobby({ phase: "lobby", localPlayer: null, roomId: null, mode: null });
    setRemotePlayers(new Map());
    setResolvedRoomId(null);
    setNetClient(null);
  }

  if (lobby.phase === "lobby") {
    return <RoomLobby onEnter={handleEnter} />;
  }

  const { localPlayer } = lobby;
  const displayRoomId = resolvedRoomId ?? lobby.roomId ?? "...";
  const totalPlayers = remotePlayers.size + 1;

  return (
    <div className="relative w-screen h-screen bg-neutral-950">
      {/* Room bar - fixed at top */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 text-xs font-mono text-stone-500 bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
        <span>
          {localPlayer!.avatar} {localPlayer!.name}
        </span>
        <span>·</span>
        <span>
          room{" "}
          <span className="text-yellow-400 tracking-widest font-bold">
            {displayRoomId}
          </span>
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(displayRoomId)}
          className="text-stone-600 hover:text-yellow-400 transition-colors"
          title="copy room code"
        >
          📋
        </button>
        <span>·</span>
        <span className="text-stone-600">{totalPlayers}/8</span>
        <span>·</span>
        <button
          onClick={handleLeave}
          className="text-stone-600 hover:text-stone-400 underline"
        >
          leave
        </button>
      </div>

      {/* Who's here - fixed below room bar */}
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 flex-wrap justify-center max-w-4xl">
        <span className="text-xs font-mono bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-full px-3 py-1">
          {localPlayer!.avatar} {localPlayer!.name} (you)
        </span>
        {Array.from(remotePlayers.values()).map((p) => (
          <span
            key={p.id}
            className="text-xs font-mono bg-green-900/30 text-green-400 border border-green-800 rounded-full px-3 py-1"
          >
            {p.avatar} {p.name}
          </span>
        ))}
      </div>

      {/* HUD - fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <HUD time={timerDisplay} status={playerState} />
      </div>

      {/* Fullscreen canvas */}
      <GameCanvas
        onStateChange={handleStateChange}
        netClient={netClient ?? undefined}
        remotePlayers={remotePlayers}
        character={localPlayer!.character}
      />

      {/* Controls hint - fixed at bottom */}
      <p className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-stone-600 text-xs font-mono bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
        WASD / arrow keys to move &nbsp;·&nbsp; E to sit / stand
      </p>
    </div>
  );
}
