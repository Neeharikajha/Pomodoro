// src/net/client.ts
// Wraps the PartyKit WebSocket connection.
// Handles: connecting, joining a room, sending position, receiving others.
//
// Random room: we call the server's HTTP endpoint on a well-known "lobby"
// room to find an open room, then connect to it.
import PartySocket from "partysocket";
const PARTYKIT_HOST = import.meta.env.DEV
    ? "127.0.0.1:1999" // local dev server (npx partykit dev)
    : "cafe-sim.YOUR_USERNAME.partykit.dev"; // ← replace with your deployed URL after: npx partykit deploy
// ─── Random room discovery ────────────────────────────────────────────────────
// We keep a fixed list of "known" room IDs and check which ones have space.
// Simple and requires no separate lobby server.
const RANDOM_POOL = ["open-01", "open-02", "open-03", "open-04", "open-05"];
async function findOpenRoom() {
    for (const roomId of RANDOM_POOL) {
        try {
            const res = await fetch(`https://${PARTYKIT_HOST}/parties/main/${roomId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.open)
                    return roomId;
            }
        }
        catch {
            // network error on this room — try next
        }
    }
    // fallback: just join the first pool room
    return RANDOM_POOL[0];
}
// ─── Main client factory ──────────────────────────────────────────────────────
export function createNetClient(localPlayer, roomId, mode, onUpdate, callbacks = {}) {
    const remotePlayers = new Map();
    let resolvedRoomId = roomId;
    let socket = null;
    // ── Connect (async so we can resolve random room first) ───────────────────
    async function connect() {
        if (mode === "random") {
            resolvedRoomId = await findOpenRoom();
        }
        socket = new PartySocket({
            host: PARTYKIT_HOST,
            room: resolvedRoomId,
        });
        socket.addEventListener("open", () => {
            // Announce ourselves to the room
            socket.send(JSON.stringify({
                type: "join",
                id: localPlayer.id,
                name: localPlayer.name,
                avatar: localPlayer.avatar,
                character: localPlayer.character,
                micMuted: true,
                videoEnabled: false,
            }));
        });
        socket.addEventListener("message", (evt) => {
            const msg = JSON.parse(evt.data);
            handleMessage(msg);
        });
        socket.addEventListener("close", () => {
            remotePlayers.clear();
            onUpdate(new Map(remotePlayers));
        });
    }
    // ── Handle incoming messages ───────────────────────────────────────────────
    function handleMessage(msg) {
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
            case "timer_updates": {
                // Handle live timer updates from server
                let hasUpdates = false;
                for (const update of msg.updates) {
                    const p = remotePlayers.get(update.id);
                    if (p && p.state === "sitting" && p.seatTimer !== update.seatTimer) {
                        // Create new player object to trigger React re-render
                        remotePlayers.set(update.id, { ...p, seatTimer: update.seatTimer });
                        hasUpdates = true;
                    }
                }
                if (hasUpdates) {
                    onUpdate(new Map(remotePlayers));
                }
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
    // ── Send local player position (called every frame from loop.ts) ──────────
    function sendMove(x, y, state, seatTimer = 0) {
        if (!socket || socket.readyState !== WebSocket.OPEN)
            return;
        socket.send(JSON.stringify({
            type: "move",
            id: localPlayer.id,
            x: Math.round(x),
            y: Math.round(y),
            state,
            seatTimer: Math.round(seatTimer),
        }));
    }
    // ── Clean disconnect ──────────────────────────────────────────────────────
    function disconnect() {
        if (!socket)
            return;
        socket.send(JSON.stringify({ type: "leave", id: localPlayer.id }));
        socket.close();
    }
    // ── Expose resolved room ID (useful for display after random join) ────────
    function getRoomId() {
        return resolvedRoomId;
    }
    function sendMediaState(micMuted, videoEnabled) {
        if (!socket || socket.readyState !== WebSocket.OPEN)
            return;
        socket.send(JSON.stringify({
            type: "media_state",
            id: localPlayer.id,
            micMuted,
            videoEnabled,
        }));
    }
    function sendWebRTCSignal(toId, payload) {
        if (!socket || socket.readyState !== WebSocket.OPEN)
            return;
        socket.send(JSON.stringify({
            type: "webrtc_signal",
            fromId: localPlayer.id,
            toId,
            payload,
        }));
    }
    connect(); // fire and forget — socket events handle the rest
    return {
        sendMove,
        sendMediaState,
        sendWebRTCSignal,
        disconnect,
        getRoomId,
    };
}
