import { useState, useCallback, useEffect, useRef } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import RoomLobby from "./components/RoomLobby";
import MediaOverlay from "./components/MediaOverlay";
import type { PlayerState } from "./game/types";
import type { LocalPlayer, RoomId, LobbyState } from "./net/types";
import {
  createNetClient,
  type NetClient,
  type RemotePlayer,
  type WebRTCSignalMessage,
} from "./net/client";
import { useRoomMedia } from "./net/media";

const SESSION_KEY = "cafe-sim:session";
type RoutePath = "/lobby" | "/cafe-canvas";

interface PersistedSession {
  localPlayer: LocalPlayer;
  roomId: RoomId;
  mode: "create" | "join" | "random";
}

function normalizeRoute(pathname: string): RoutePath {
  return pathname === "/cafe-canvas" ? "/cafe-canvas" : "/lobby";
}

function readSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed?.localPlayer?.id || !parsed?.roomId || !parsed?.mode) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: PersistedSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [route, setRoute] = useState<RoutePath>(() =>
    normalizeRoute(window.location.pathname),
  );
  const [restoredSession] = useState<PersistedSession | null>(() =>
    route === "/cafe-canvas" ? readSession() : null,
  );
  const [timerDisplay, setTimerDisplay] = useState<string>("00:00");
  const [playerState, setPlayerState] = useState<PlayerState>("walking");
  const [lobby, setLobby] = useState<LobbyState>(() => {
    if (restoredSession) {
      return {
        phase: "game",
        localPlayer: restoredSession.localPlayer,
        roomId: restoredSession.roomId,
        mode: restoredSession.mode,
      };
    }
    return {
      phase: "lobby",
      localPlayer: null,
      roomId: null,
      mode: null,
    };
  });
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(
    new Map(),
  );
  const [resolvedRoomId, setResolvedRoomId] = useState<RoomId | null>(null);
  const [netClient, setNetClient] = useState<NetClient | null>(null);
  const [videoSize, setVideoSize] = useState(120);
  const mediaSignalHandlerRef = useRef<
    ((signal: WebRTCSignalMessage) => Promise<void>) | null
  >(null);

  const navigate = useCallback((nextRoute: RoutePath, replace = false) => {
    if (window.location.pathname !== nextRoute) {
      if (replace) {
        window.history.replaceState(null, "", nextRoute);
      } else {
        window.history.pushState(null, "", nextRoute);
      }
    }
    setRoute(nextRoute);
  }, []);

  const handleStateChange = useCallback(
    (state: PlayerState, display: string) => {
      setPlayerState(state);
      setTimerDisplay(display);
    },
    [],
  );

  const media = useRoomMedia(lobby.localPlayer?.id ?? "", netClient, remotePlayers);

  useEffect(() => {
    mediaSignalHandlerRef.current = media.handleSignal;
  }, [media.handleSignal]);

  useEffect(() => {
    if (window.location.pathname !== route) {
      navigate(route, true);
    }
  }, [route, navigate]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  function handleEnter(
    player: LocalPlayer,
    roomId: RoomId,
    mode: "create" | "join" | "random",
  ) {
    writeSession({ localPlayer: player, roomId, mode });
    const client = createNetClient(
      player,
      roomId,
      mode,
      (players) => setRemotePlayers(new Map(players)),
      {
        onWebRTCSignal: (signal) => {
          void mediaSignalHandlerRef.current?.(signal);
        },
      },
    );
    setNetClient(client);
    setLobby({ phase: "game", localPlayer: player, roomId, mode });
    navigate("/cafe-canvas");
  }

  useEffect(() => {
    if (route !== "/cafe-canvas") return;
    if (lobby.phase !== "game") return;
    if (netClient) return;
    if (!lobby.localPlayer || !lobby.roomId || !lobby.mode) return;

    const client = createNetClient(
      lobby.localPlayer,
      lobby.roomId,
      lobby.mode,
      (players) => setRemotePlayers(new Map(players)),
      {
        onWebRTCSignal: (signal) => {
          void mediaSignalHandlerRef.current?.(signal);
        },
      },
    );
    setNetClient(client);
  }, [route, lobby, netClient]);

  useEffect(() => {
    if (lobby.phase === "game" && route !== "/cafe-canvas") {
      navigate("/cafe-canvas", true);
    }
    if (lobby.phase === "lobby" && route !== "/lobby") {
      navigate("/lobby", true);
    }
  }, [lobby.phase, route, navigate]);

  useEffect(() => {
    if (route !== "/cafe-canvas") return;
    if (lobby.phase === "game") return;
    const session = readSession();
    if (!session) {
      navigate("/lobby", true);
      return;
    }
    setLobby({
      phase: "game",
      localPlayer: session.localPlayer,
      roomId: session.roomId,
      mode: session.mode,
    });
  }, [route, lobby.phase, navigate]);

  useEffect(() => {
    if (!netClient) return;

    const interval = setInterval(() => {
      const id = netClient.getRoomId();
      if (id !== "__random__") {
        setResolvedRoomId(id);
        if (lobby.localPlayer) {
          writeSession({
            localPlayer: lobby.localPlayer,
            roomId: id,
            mode: "join",
          });
        }
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [netClient, lobby.localPlayer]);

  function handleLeave() {
    netClient?.disconnect();
    clearSession();
    setLobby({ phase: "lobby", localPlayer: null, roomId: null, mode: null });
    setRemotePlayers(new Map());
    setResolvedRoomId(null);
    setNetClient(null);
    navigate("/lobby");
  }

  if (route === "/lobby" || lobby.phase === "lobby") {
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

      <MediaOverlay
        remotePlayers={remotePlayers}
        remoteStreams={media.remoteStreams}
        localStream={media.localStream}
        micMuted={media.micMuted}
        videoEnabled={media.videoEnabled}
        videoSize={videoSize}
        onVideoSizeChange={setVideoSize}
        onToggleMic={() => {
          void media.toggleMic();
        }}
        onToggleVideo={() => {
          void media.toggleVideo();
        }}
      />

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
