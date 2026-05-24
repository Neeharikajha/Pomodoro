// src/game/remotePlayer.ts
// Draws remote players on the canvas.
// Green body so they're visually distinct from the local player (blue).
// Avatar emoji + name label float above them.
// Mirrors the sitting/walking visual from player.ts.
export function drawRemotePlayers(ctx, players) {
    for (const player of players.values()) {
        drawRemotePlayer(ctx, player);
    }
}
function drawRemotePlayer(ctx, player) {
    const { x, y, state, avatar, name } = player;
    const w = 32;
    const h = 32;
    if (state === "sitting") {
        drawRemoteSitting(ctx, x, y, w, h, avatar, name);
    }
    else {
        drawRemoteWalking(ctx, x, y, w, h, avatar, name);
    }
}
function drawRemoteWalking(ctx, x, y, w, h, avatar, name) {
    // Body — green to distinguish from local player
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(x, y, w, h);
    // Direction nub
    ctx.fillStyle = "#14532d";
    ctx.fillRect(x + 10, y + 4, 12, 7);
    // Outline
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
    // Label above
    drawLabel(ctx, x + w / 2, y - 6, avatar, name);
}
function drawRemoteSitting(ctx, x, y, w, h, avatar, name) {
    const sittingH = h * 0.65;
    const sittingY = y + (h - sittingH);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(x, sittingY, w, sittingH);
    // Eyes
    ctx.fillStyle = "#14532d";
    ctx.fillRect(x + 8, sittingY + 6, 4, 4);
    ctx.fillRect(x + 20, sittingY + 6, 4, 4);
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, sittingY + 0.75, w - 1.5, sittingH - 1.5);
    drawLabel(ctx, x + w / 2, sittingY - 6, avatar, name);
}
function drawLabel(ctx, cx, y, avatar, name) {
    const label = `${avatar} ${name}`;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    // Subtle dark pill behind the text so it's readable over any background
    const metrics = ctx.measureText(label);
    const pw = metrics.width + 10;
    const ph = 14;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.roundRect(cx - pw / 2, y - ph + 2, pw, ph, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(label, cx, y);
    ctx.textAlign = "left";
}
