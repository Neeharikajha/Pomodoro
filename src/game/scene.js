// scene.ts
import { WALLS, BENCHES, FURNITURE, LEFT_BOTTOM_FURNITURE, RIGHT_ALL_FURNITURE, CANVAS_WIDTH, CANVAS_HEIGHT, } from "./world";
// 🟧 Draw Benches — small dot indicator only
function drawBenches(ctx) {
    for (const bench of BENCHES) {
        const zone = bench.sitZone;
        const cx = zone.x + zone.width / 2;
        const cy = zone.y + zone.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fill();
    }
}
// 🎬 Main Scene Renderer
export function drawScene(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBenches(ctx);
}
export function getSolidRects() {
    return [
        ...WALLS,
        ...FURNITURE,
        ...LEFT_BOTTOM_FURNITURE,
        ...RIGHT_ALL_FURNITURE,
        // BENCHES excluded — player must walk into sitZone to trigger sit
    ];
}
export { CANVAS_WIDTH, CANVAS_HEIGHT };
