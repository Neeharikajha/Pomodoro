// party/server.ts
// PartyKit server. One instance per room (PartyKit spins up a new
// instance for each unique room ID automatically).
//
// Responsibilities:
//   - Track who's in the room (name, avatar, id)
//   - Broadcast joins/leaves to everyone
//   - Relay position updates between players
//   - Expose room list for "random room" feature via HTTP GET

import type * as Party from "partykit/server";

// Shape of a connected player (stored in room state)
interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  character: string;
  x: number;
  y: number;
  state: "walking" | "sitting";
  seatTimer: number; // seconds seated (accumulated)
  seatStartTime: number; // timestamp when sitting started (for server-side timer calculation)
  micMuted: boolean;
  videoEnabled: boolean;
}

// All message types the server handles
type ClientMessage =
  | {
      type: "join";
      id: string;
      name: string;
      avatar: string;
      character: string;
      micMuted: boolean;
      videoEnabled: boolean;
    }
  | {
      type: "move";
      id: string;
      x: number;
      y: number;
      state: "walking" | "sitting";
      seatTimer: number;
    }
  | { type: "media_state"; id: string; micMuted: boolean; videoEnabled: boolean }
  | { type: "webrtc_signal"; fromId: string; toId: string; payload: unknown }
  | { type: "leave"; id: string };

export default class CafeServer implements Party.Server {
  // players keyed by their connection id
  players: Map<string, RoomPlayer> = new Map();
  // Timer to broadcast updates every second
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(readonly room: Party.Room) {
    // Start timer broadcast interval
    this.timerInterval = setInterval(() => {
      this.broadcastTimerUpdates();
    }, 1000); // Update every second
  }

  // ── HTTP GET: return room info (used for random room discovery) ──────────
  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method === "GET") {
      return Response.json({
        roomId: this.room.id,
        players: this.players.size,
        open: this.players.size < 8,
      });
    }
    return new Response("method not allowed", { status: 405 });
  }

  // ── New WebSocket connection ──────────────────────────────────────────────
  onConnect(conn: Party.Connection) {
    // Send the new player the current room state (all existing players)
    const snapshot = {
      type: "room_snapshot",
      players: Array.from(this.players.values()),
    };
    conn.send(JSON.stringify(snapshot));
  }

  // ── Message received from a client ───────────────────────────────────────
  onMessage(raw: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Replace onMessage's "join" block with this:
    if (msg.type === "join") {
      const player: RoomPlayer = {
        id: msg.id,
        name: msg.name,
        avatar: msg.avatar,
        character: msg.character,
        x: 480,
        y: 320,
        state: "walking",
        seatTimer: 0,
        seatStartTime: 0,
        micMuted: msg.micMuted ?? true,
        videoEnabled: msg.videoEnabled ?? false,
      };
      this.players.set(msg.id, player);
      (sender as any).__playerId = msg.id; // attach so onClose can find it

      // Restart timer if this is the first player
      if (this.players.size === 1 && !this.timerInterval) {
        this.timerInterval = setInterval(() => {
          this.broadcastTimerUpdates();
        }, 1000);
      }

      this.room.broadcast(JSON.stringify({ type: "player_joined", player }), [
        sender.id,
      ]);
    }

    if (msg.type === "move") {
      const player = this.players.get(msg.id);
      if (!player) return;

      const wasWalking = player.state === "walking";
      const nowSitting = msg.state === "sitting";

      player.x = msg.x;
      player.y = msg.y;

      // Handle state transitions
      if (wasWalking && nowSitting) {
        // Started sitting - record start time and use client's timer
        player.seatStartTime = Date.now();
        player.seatTimer = msg.seatTimer;
      } else if (player.state === "sitting" && msg.state === "walking") {
        // Stopped sitting - accumulate time and reset start
        if (player.seatStartTime > 0) {
          const sessionTime = Math.floor(
            (Date.now() - player.seatStartTime) / 1000,
          );
          player.seatTimer += sessionTime;
        }
        player.seatStartTime = 0;
      } else if (nowSitting) {
        // Still sitting - update timer from client (handles reconnections)
        player.seatTimer = msg.seatTimer;
      }

      player.state = msg.state;

      // Relay to everyone except sender
      this.room.broadcast(
        JSON.stringify({
          type: "player_moved",
          id: msg.id,
          x: msg.x,
          y: msg.y,
          state: msg.state,
          seatTimer: this.getCurrentSeatTimer(player),
          micMuted: player.micMuted,
          videoEnabled: player.videoEnabled,
        }),
        [sender.id],
      );
    }

    if (msg.type === "media_state") {
      const player = this.players.get(msg.id);
      if (!player) return;
      player.micMuted = msg.micMuted;
      player.videoEnabled = msg.videoEnabled;
      this.room.broadcast(
        JSON.stringify({
          type: "player_media_updated",
          id: msg.id,
          micMuted: msg.micMuted,
          videoEnabled: msg.videoEnabled,
        }),
        [sender.id],
      );
    }

    if (msg.type === "webrtc_signal") {
      // Relay signaling payload to all clients; receiver filters by toId.
      this.room.broadcast(
        JSON.stringify({
          type: "webrtc_signal",
          fromId: msg.fromId,
          toId: msg.toId,
          payload: msg.payload,
        }),
      );
    }

    if (msg.type === "leave") {
      this.players.delete(msg.id);
      this.room.broadcast(JSON.stringify({ type: "player_left", id: msg.id }));
    }
  }

  // ── Connection dropped (tab closed, network loss etc.) ───────────────────
  onClose(conn: Party.Connection) {
    // Find which player owned this connection and broadcast their departure
    for (const [playerId, _player] of this.players.entries()) {
      // PartyKit connection ids are separate from our player ids,
      // so we track a connectionId → playerId map via a side map
      if ((conn as any).__playerId === playerId) {
        this.players.delete(playerId);
        this.room.broadcast(
          JSON.stringify({ type: "player_left", id: playerId }),
        );
        break;
      }
    }

    // Clean up timer if no players left
    if (this.players.size === 0 && this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ── Helper methods for timer management ──────────────────────────────────
  private getCurrentSeatTimer(player: RoomPlayer): number {
    if (player.state === "sitting" && player.seatStartTime > 0) {
      const sessionTime = Math.floor(
        (Date.now() - player.seatStartTime) / 1000,
      );
      return player.seatTimer + sessionTime;
    }
    return player.seatTimer;
  }

  private broadcastTimerUpdates(): void {
    const updates: any[] = [];

    for (const player of this.players.values()) {
      if (player.state === "sitting" && player.seatStartTime > 0) {
        const currentTimer = this.getCurrentSeatTimer(player);
        updates.push({
          id: player.id,
          seatTimer: currentTimer,
        });
      }
    }

    if (updates.length > 0) {
      this.room.broadcast(
        JSON.stringify({
          type: "timer_updates",
          updates,
        }),
      );
    }
  }
}

CafeServer satisfies Party.Worker;
