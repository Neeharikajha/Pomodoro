import { io, Socket } from "socket.io-client";
import type { LocalPlayer, RoomId } from "./types";

export interface RemotePlayer {
  id: string;
  name: string;
  avatar: string;
  character: string;
  x: number;
  y: number;
  state: "walking" | "sitting";
  seatTimer: number;
  micMuted: boolean;
  videoEnabled: boolean;
}

export type NetEventCallback = (
  remotePlayers: Map<string, RemotePlayer>,
) => void;

export interface NetCallbacks {
  onWebRTCSignal?: (signal: WebRTCSignalMessage) => void;
}

export interface WebRTCSignalMessage {
  fromId: string;
  toId: string;
  payload: unknown;
}

const SERVER_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : window.location.origin;

const RANDOM_POOL = ["open-01", "open-02", "open-03", "open-04", "open-05"];

async function findOpenRoom(): Promise<RoomId> {
  return RANDOM_POOL[0];
}

export function createNetClient(
  localPlayer: LocalPlayer,
  roomId: RoomId,
  mode: "create" | "join" | "random",
  onUpdate: NetEventCallback,
  callbacks: NetCallbacks = {},
) {
  const remotePlayers = new Map<string, RemotePlayer>();
  let resolvedRoomId = roomId;
  let socket: Socket | null = null;

  async function connect() {
    if (mode === "random") {
      resolvedRoomId = await findOpenRoom();
    }

    socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("[CLIENT] Connected to server");
      socket!.emit("join", {
        roomId: resolvedRoomId,
        player: {
          id: localPlayer.id,
          name: localPlayer.name,
          avatar: localPlayer.avatar,
          character: localPlayer.character,
          micMuted: true,
          videoEnabled: false,
        },
      });
    });

    socket.on("message", (msg: any) => {
      console.log("[CLIENT] Message received:", msg.type);
      handleMessage(msg);
    });

    socket.on("disconnect", () => {
      console.log("[CLIENT] Disconnected from server");
      remotePlayers.clear();
      onUpdate(new Map(remotePlayers));
    });

    socket.on("error", (error: any) => {
      console.error("[CLIENT] Socket error:", error);
    });
  }

  function handleMessage(msg: any) {
    switch (msg.type) {
      case "room_snapshot": {
        for (const p of msg.players) {
          if (p.id !== localPlayer.id) {
            remotePlayers.set(p.id, {
              ...p,
              character: p.character ?? "",
              seatTimer: p.seatTimer ?? 0,
              micMuted: p.micMuted ?? true,
              videoEnabled: p.videoEnabled ?? false,
            });
          }
        }
        onUpdate(new Map(remotePlayers));
        break;
      }
      case "player_joined": {
        if (msg.player.id !== localPlayer.id) {
          remotePlayers.set(msg.player.id, {
            ...msg.player,
            character: msg.player.character ?? "",
            seatTimer: msg.player.seatTimer ?? 0,
            micMuted: msg.player.micMuted ?? true,
            videoEnabled: msg.player.videoEnabled ?? false,
          });
          onUpdate(new Map(remotePlayers));
        }
        break;
      }
      case "player_moved": {
        const p = remotePlayers.get(msg.id);
        if (p) {
          p.x = msg.x;
          p.y = msg.y;
          p.state = msg.state;
          p.seatTimer = msg.seatTimer ?? 0;
          p.micMuted = msg.micMuted ?? p.micMuted;
          p.videoEnabled = msg.videoEnabled ?? p.videoEnabled;
          onUpdate(new Map(remotePlayers));
        }
        break;
      }
      case "player_media_updated": {
        const p = remotePlayers.get(msg.id);
        if (p) {
          p.micMuted = msg.micMuted ?? p.micMuted;
          p.videoEnabled = msg.videoEnabled ?? p.videoEnabled;
          onUpdate(new Map(remotePlayers));
        }
        break;
      }
      case "player_left": {
        remotePlayers.delete(msg.id);
        onUpdate(new Map(remotePlayers));
        break;
      }
      case "webrtc_signal": {
        callbacks.onWebRTCSignal?.({
          fromId: msg.fromId,
          toId: msg.toId,
          payload: msg.payload,
        });
        break;
      }
    }
  }

  function sendMove(
    x: number,
    y: number,
    state: "walking" | "sitting",
    seatTimer = 0,
  ) {
    if (!socket || !socket.connected) return;
    socket.emit("move", {
      x: Math.round(x),
      y: Math.round(y),
      state,
      seatTimer: Math.round(seatTimer),
    });
  }

  function disconnect() {
    if (!socket) return;
    socket.disconnect();
  }

  function getRoomId(): RoomId {
    return resolvedRoomId;
  }

  function sendMediaState(micMuted: boolean, videoEnabled: boolean) {
    if (!socket || !socket.connected) return;
    socket.emit("media_state", {
      micMuted,
      videoEnabled,
    });
  }

  function sendWebRTCSignal(toId: string, payload: unknown) {
    if (!socket || !socket.connected) return;
    socket.emit("webrtc_signal", {
      fromId: localPlayer.id,
      toId,
      payload,
    });
  }

  connect();

  return {
    sendMove,
    sendMediaState,
    sendWebRTCSignal,
    disconnect,
    getRoomId,
  };
}

export type NetClient = ReturnType<typeof createNetClient>;
