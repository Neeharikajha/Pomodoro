// party/server.ts
// PartyKit server. One instance per room (PartyKit spins up a new
// instance for each unique room ID automatically).
//
// Responsibilities:
//   - Track who's in the room (name, avatar, id)
//   - Broadcast joins/leaves to everyone
//   - Relay position updates between players
//   - Expose room list for "random room" feature via HTTP GET
export default class CafeServer {
    constructor(room) {
        this.room = room;
        // players keyed by their connection id
        this.players = new Map();
    }
    // ── HTTP GET: return room info (used for random room discovery) ──────────
    async onRequest(req) {
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
    onConnect(conn) {
        // Send the new player the current room state (all existing players)
        const snapshot = {
            type: "room_snapshot",
            players: Array.from(this.players.values()),
        };
        conn.send(JSON.stringify(snapshot));
    }
    // ── Message received from a client ───────────────────────────────────────
    onMessage(raw, sender) {
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch {
            return;
        }
        // Replace onMessage's "join" block with this:
        if (msg.type === "join") {
            const player = {
                id: msg.id,
                name: msg.name,
                avatar: msg.avatar,
                x: 480,
                y: 320,
                state: "walking",
            };
            this.players.set(msg.id, player);
            sender.__playerId = msg.id; // attach so onClose can find it
            this.room.broadcast(JSON.stringify({ type: "player_joined", player }), [
                sender.id,
            ]);
        }
        if (msg.type === "move") {
            const player = this.players.get(msg.id);
            if (!player)
                return;
            player.x = msg.x;
            player.y = msg.y;
            player.state = msg.state;
            // Relay to everyone except sender
            this.room.broadcast(JSON.stringify({
                type: "player_moved",
                id: msg.id,
                x: msg.x,
                y: msg.y,
                state: msg.state,
            }), [sender.id]);
        }
        if (msg.type === "leave") {
            this.players.delete(msg.id);
            this.room.broadcast(JSON.stringify({ type: "player_left", id: msg.id }));
        }
    }
    // ── Connection dropped (tab closed, network loss etc.) ───────────────────
    onClose(conn) {
        // Find which player owned this connection and broadcast their departure
        for (const [playerId, _player] of this.players.entries()) {
            // PartyKit connection ids are separate from our player ids,
            // so we track a connectionId → playerId map via a side map
            if (conn.__playerId === playerId) {
                this.players.delete(playerId);
                this.room.broadcast(JSON.stringify({ type: "player_left", id: playerId }));
                break;
            }
        }
    }
}
CafeServer;
