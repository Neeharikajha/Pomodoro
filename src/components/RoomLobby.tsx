// RoomLobby.tsx
// Shown before the game. Lets the player pick a name/avatar,
// then create a room, join with a code, or join a random room.
// Calls onEnter() when ready — App.tsx transitions to the game.

import { useState } from "react";
import type { LocalPlayer, RoomId } from "../net/types";

const AVATARS = ["🐱", "🐶", "🦊", "🐸", "🐼", "🦋", "🌸", "⚡"];

interface Props {
  onEnter: (player: LocalPlayer, roomId: RoomId, mode: "create" | "join" | "random") => void;
}

export default function RoomLobby({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "random" | null>(null);
  const [error, setError] = useState("");

  const localPlayer: LocalPlayer = {
    id: crypto.randomUUID(),
    name: name.trim() || "Guest",
    avatar,
  };

  function handleCreate() {
    if (!name.trim()) { setError("pick a name first"); return; }
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    onEnter(localPlayer, roomId, "create");
  }

  function handleJoin() {
    if (!name.trim()) { setError("pick a name first"); return; }
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setError("enter a valid room code"); return; }
    onEnter(localPlayer, code, "join");
  }

  function handleRandom() {
    if (!name.trim()) { setError("pick a name first"); return; }
    onEnter(localPlayer, "__random__", "random");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 gap-6 font-mono">
      <h1 className="text-stone-500 text-sm uppercase tracking-widest">☕ café sim</h1>

      {/* Name + Avatar */}
      <div className="w-full max-w-sm flex flex-col gap-4 bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div>
          <label className="text-stone-500 text-xs uppercase tracking-widest block mb-2">
            your name
          </label>
          <input
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-yellow-400"
            placeholder="e.g. Mochi"
            maxLength={16}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
          />
        </div>

        <div>
          <label className="text-stone-500 text-xs uppercase tracking-widest block mb-2">
            avatar
          </label>
          <div className="flex gap-2 flex-wrap">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`text-2xl p-1.5 rounded-lg border transition-all ${
                  avatar === a
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-stone-700 bg-stone-800 hover:border-stone-500"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Create */}
        <button
          onClick={handleCreate}
          className="flex items-center gap-3 bg-stone-900 border border-stone-700 hover:border-stone-500 rounded-xl px-4 py-3 text-left transition-colors"
        >
          <span className="text-xl">✨</span>
          <div>
            <p className="text-stone-200 text-sm font-semibold">create room</p>
            <p className="text-stone-500 text-xs">get a shareable code</p>
          </div>
        </button>

        {/* Join with code */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3">
          <button
            onClick={() => setMode(mode === "join" ? null : "join")}
            className="flex items-center gap-3 w-full text-left"
          >
            <span className="text-xl">🔑</span>
            <div>
              <p className="text-stone-200 text-sm font-semibold">join room</p>
              <p className="text-stone-500 text-xs">enter a room code</p>
            </div>
          </button>

          {mode === "join" && (
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-yellow-400 text-sm tracking-widest uppercase placeholder-stone-600 focus:outline-none focus:border-yellow-400"
                placeholder="CAFE42"
                maxLength={8}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                onClick={handleJoin}
                className="bg-yellow-400 text-stone-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-yellow-300 transition-colors"
              >
                go
              </button>
            </div>
          )}
        </div>

        {/* Random */}
        <button
          onClick={handleRandom}
          className="flex items-center gap-3 bg-stone-900 border border-stone-700 hover:border-stone-500 rounded-xl px-4 py-3 text-left transition-colors"
        >
          <span className="text-xl">🎲</span>
          <div>
            <p className="text-stone-200 text-sm font-semibold">random room</p>
            <p className="text-stone-500 text-xs">join any open room</p>
          </div>
        </button>
      </div>
    </div>
  );
}