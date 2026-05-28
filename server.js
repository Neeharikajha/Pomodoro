import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Serve static files from dist
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Room state management
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      players: new Map(),
    });
  }
  return rooms.get(roomId);
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[SERVER] Client connected: ${socket.id}`);

  let currentRoom = null;
  let playerId = null;

  socket.on("join", (data) => {
    const { roomId, player } = data;
    console.log(`[SERVER] Player joining room ${roomId}:`, player.name);

    currentRoom = getOrCreateRoom(roomId);
    playerId = player.id;

    // Store player in room
    currentRoom.players.set(playerId, {
      ...player,
      x: 480,
      y: 320,
      state: "walking",
      seatTimer: 0,
      seatStartTime: 0,
    });

    // Join socket to room
    socket.join(roomId);

    // Send current room state to new player
    const snapshot = {
      type: "room_snapshot",
      players: Array.from(currentRoom.players.values()),
    };
    socket.emit("message", snapshot);

    // Broadcast player joined to others
    socket.to(roomId).emit("message", {
      type: "player_joined",
      player: currentRoom.players.get(playerId),
    });

    console.log(
      `[SERVER] Room ${roomId} now has ${currentRoom.players.size} players`,
    );
  });

  socket.on("move", (data) => {
    if (!currentRoom || !playerId) return;

    const player = currentRoom.players.get(playerId);
    if (!player) return;

    const wasWalking = player.state === "walking";
    const nowSitting = data.state === "sitting";

    player.x = data.x;
    player.y = data.y;

    if (wasWalking && nowSitting) {
      player.seatStartTime = Date.now();
      player.seatTimer = data.seatTimer;
    } else if (player.state === "sitting" && data.state === "walking") {
      if (player.seatStartTime > 0) {
        const sessionTime = Math.floor(
          (Date.now() - player.seatStartTime) / 1000,
        );
        player.seatTimer += sessionTime;
      }
      player.seatStartTime = 0;
    } else if (nowSitting) {
      player.seatTimer = data.seatTimer;
    }

    player.state = data.state;

    socket.to(currentRoom.id).emit("message", {
      type: "player_moved",
      id: playerId,
      x: player.x,
      y: player.y,
      state: player.state,
      seatTimer: player.seatTimer,
      micMuted: player.micMuted,
      videoEnabled: player.videoEnabled,
    });
  });

  socket.on("media_state", (data) => {
    if (!currentRoom || !playerId) return;

    const player = currentRoom.players.get(playerId);
    if (!player) return;

    player.micMuted = data.micMuted;
    player.videoEnabled = data.videoEnabled;

    socket.to(currentRoom.id).emit("message", {
      type: "player_media_updated",
      id: playerId,
      micMuted: data.micMuted,
      videoEnabled: data.videoEnabled,
    });
  });

  socket.on("webrtc_signal", (data) => {
    if (!currentRoom) return;

    io.to(currentRoom.id).emit("message", {
      type: "webrtc_signal",
      fromId: data.fromId,
      toId: data.toId,
      payload: data.payload,
    });
  });

  socket.on("disconnect", () => {
    if (currentRoom && playerId) {
      console.log(`[SERVER] Player disconnecting: ${playerId}`);
      currentRoom.players.delete(playerId);

      socket.to(currentRoom.id).emit("message", {
        type: "player_left",
        id: playerId,
      });

      console.log(
        `[SERVER] Room ${currentRoom.id} now has ${currentRoom.players.size} players`,
      );

      // Clean up empty rooms
      if (currentRoom.players.size === 0) {
        rooms.delete(currentRoom.id);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
