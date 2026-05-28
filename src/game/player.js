import { isAnyKeyHeld } from "./input";
import { getSprite } from "./sprites";
export function createPlayer(canvasWidth, canvasHeight, character = "Boy1") {
    return {
        x: canvasWidth / 2 - 36,
        y: canvasHeight / 2 - 36,
        width: 80, // 48 * 1.5
        height: 88,
        speed: 180,
        state: "walking",
        character,
        facing: "right",
    };
}
export function updatePlayer(player, dt) {
    if (player.state === "sitting")
        return;
    const dist = player.speed * dt;
    if (isAnyKeyHeld(["arrowup", "w"]))
        player.y -= dist;
    if (isAnyKeyHeld(["arrowdown", "s"]))
        player.y += dist;
    if (isAnyKeyHeld(["arrowleft", "a"])) {
        player.x -= dist;
        player.facing = "left";
    }
    if (isAnyKeyHeld(["arrowright", "d"])) {
        player.x += dist;
        player.facing = "right";
    }
}
export function drawPlayer(ctx, player) {
    const { x, y, width: w, height: h, character, facing, state } = player;
    const sprite = character ? getSprite(character) : null;
    ctx.save();
    // Flip horizontally when facing left
    if (facing === "left") {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(x + w / 2), -(y + h / 2));
    }
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        // Slight bob when walking
        const bobY = state === "walking" ? Math.sin(Date.now() / 150) * 1.5 : 0;
        ctx.globalAlpha = state === "sitting" ? 0.85 : 1;
        ctx.drawImage(sprite, x, y + bobY, w, h);
        ctx.globalAlpha = 1;
    }
    else {
        // Fallback box (emoji avatar mode or sprite not loaded)
        ctx.fillStyle = state === "sitting" ? "#facc15" : "#60a5fa";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = state === "sitting" ? "#78350f" : "#1d4ed8";
        ctx.fillRect(x + w * 0.3, y + h * 0.25, w * 0.15, w * 0.15);
        ctx.fillRect(x + w * 0.55, y + h * 0.25, w * 0.15, w * 0.15);
    }
    ctx.restore();
    // "[E] stand" hint when sitting
    if (state === "sitting") {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("[E] stand", x + w / 2, y - 6);
        ctx.textAlign = "left";
    }
}
