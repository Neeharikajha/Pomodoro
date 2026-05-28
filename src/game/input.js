// src/game/input.ts
// Tracks which keys are currently held down.
// Nothing else. No React, no canvas — just a Set and two listeners.
const heldKeys = new Set();
export function initInput() {
    const onKeyDown = (e) => {
        // Prevent arrow keys / space from scrolling the page
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
            e.preventDefault();
        }
        heldKeys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e) => {
        heldKeys.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    // Returns a cleanup function — call it when the game loop stops
    return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        heldKeys.clear();
    };
}
export function isKeyHeld(key) {
    return heldKeys.has(key.toLowerCase());
}
// Convenience: check if any of the given keys are held
export function isAnyKeyHeld(keys) {
    return keys.some((k) => heldKeys.has(k.toLowerCase()));
}
