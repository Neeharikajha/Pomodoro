import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// RoomLobby.tsx
// Shown before the game. Lets the player pick a name/avatar,
// then create a room, join with a code, or join a random room.
// Calls onEnter() when ready — App.tsx transitions to the game.
import { useState } from "react";
const AVATARS = ["🐱", "🐶", "🦊", "🐸", "🐼", "🦋", "🌸", "⚡"];
export default function RoomLobby({ onEnter }) {
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState(AVATARS[0]);
    const [joinCode, setJoinCode] = useState("");
    const [mode, setMode] = useState(null);
    const [error, setError] = useState("");
    const localPlayer = {
        id: crypto.randomUUID(),
        name: name.trim() || "Guest",
        avatar,
    };
    function handleCreate() {
        if (!name.trim()) {
            setError("pick a name first");
            return;
        }
        const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
        onEnter(localPlayer, roomId, "create");
    }
    function handleJoin() {
        if (!name.trim()) {
            setError("pick a name first");
            return;
        }
        const code = joinCode.trim().toUpperCase();
        if (code.length < 4) {
            setError("enter a valid room code");
            return;
        }
        onEnter(localPlayer, code, "join");
    }
    function handleRandom() {
        if (!name.trim()) {
            setError("pick a name first");
            return;
        }
        onEnter(localPlayer, "__random__", "random");
    }
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 gap-6 font-mono", children: [_jsx("h1", { className: "text-stone-500 text-sm uppercase tracking-widest", children: "\u2615 caf\u00E9 sim" }), _jsxs("div", { className: "w-full max-w-sm flex flex-col gap-4 bg-stone-900 border border-stone-700 rounded-xl p-5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-stone-500 text-xs uppercase tracking-widest block mb-2", children: "your name" }), _jsx("input", { className: "w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-yellow-400", placeholder: "e.g. Mochi", maxLength: 16, value: name, onChange: (e) => { setName(e.target.value); setError(""); } })] }), _jsxs("div", { children: [_jsx("label", { className: "text-stone-500 text-xs uppercase tracking-widest block mb-2", children: "avatar" }), _jsx("div", { className: "flex gap-2 flex-wrap", children: AVATARS.map((a) => (_jsx("button", { onClick: () => setAvatar(a), className: `text-2xl p-1.5 rounded-lg border transition-all ${avatar === a
                                        ? "border-yellow-400 bg-yellow-400/10"
                                        : "border-stone-700 bg-stone-800 hover:border-stone-500"}`, children: a }, a))) })] }), error && _jsx("p", { className: "text-red-400 text-xs", children: error })] }), _jsxs("div", { className: "w-full max-w-sm flex flex-col gap-3", children: [_jsxs("button", { onClick: handleCreate, className: "flex items-center gap-3 bg-stone-900 border border-stone-700 hover:border-stone-500 rounded-xl px-4 py-3 text-left transition-colors", children: [_jsx("span", { className: "text-xl", children: "\u2728" }), _jsxs("div", { children: [_jsx("p", { className: "text-stone-200 text-sm font-semibold", children: "create room" }), _jsx("p", { className: "text-stone-500 text-xs", children: "get a shareable code" })] })] }), _jsxs("div", { className: "bg-stone-900 border border-stone-700 rounded-xl px-4 py-3", children: [_jsxs("button", { onClick: () => setMode(mode === "join" ? null : "join"), className: "flex items-center gap-3 w-full text-left", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDD11" }), _jsxs("div", { children: [_jsx("p", { className: "text-stone-200 text-sm font-semibold", children: "join room" }), _jsx("p", { className: "text-stone-500 text-xs", children: "enter a room code" })] })] }), mode === "join" && (_jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("input", { className: "flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-yellow-400 text-sm tracking-widest uppercase placeholder-stone-600 focus:outline-none focus:border-yellow-400", placeholder: "CAFE42", maxLength: 8, value: joinCode, onChange: (e) => setJoinCode(e.target.value.toUpperCase()), onKeyDown: (e) => e.key === "Enter" && handleJoin() }), _jsx("button", { onClick: handleJoin, className: "bg-yellow-400 text-stone-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-yellow-300 transition-colors", children: "go" })] }))] }), _jsxs("button", { onClick: handleRandom, className: "flex items-center gap-3 bg-stone-900 border border-stone-700 hover:border-stone-500 rounded-xl px-4 py-3 text-left transition-colors", children: [_jsx("span", { className: "text-xl", children: "\uD83C\uDFB2" }), _jsxs("div", { children: [_jsx("p", { className: "text-stone-200 text-sm font-semibold", children: "random room" }), _jsx("p", { className: "text-stone-500 text-xs", children: "join any open room" })] })] })] })] }));
}
