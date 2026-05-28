import { useState } from "react";
import type { LocalPlayer, RoomId } from "../net/types";

import Boy1Url from "../assets/characters/Boy1.svg";
import Boy2Url from "../assets/characters/Boy2.svg";
import Girl1Url from "../assets/characters/Girl1.svg";
import Girl2Url from "../assets/characters/Girl2.svg";

const AVATARS = ["🐱", "🐶", "🦊", "🐸", "🐼", "🦋", "🌸", "⚡"];

const CHARACTERS = [
  { key: "Boy1", label: "Boy 1", url: Boy1Url },
  { key: "Boy2", label: "Boy 2", url: Boy2Url },
  { key: "Girl1", label: "Girl 1", url: Girl1Url },
  { key: "Girl2", label: "Girl 2", url: Girl2Url },
];

type PickerMode = "avatar" | "character";

interface Props {
  onEnter: (player: LocalPlayer, roomId: RoomId, mode: "create" | "join" | "random") => void;
}

export default function RoomLobby({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [pickerMode, setPickerMode] = useState<PickerMode>("character");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [character, setCharacter] = useState(CHARACTERS[0].key);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "random" | null>(null);
  const [error, setError] = useState("");

  const localPlayer: LocalPlayer = {
    id: crypto.randomUUID(),
    name: name.trim() || "Guest",
    avatar: pickerMode === "avatar" ? avatar : "",
    character: pickerMode === "character" ? character : "",
  };

  function handleCreate() {
    if (!name.trim()) { setError("pick a name first"); return; }
    onEnter(localPlayer, Math.random().toString(36).slice(2, 8).toUpperCase(), "create");
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

      <div className="w-full max-w-sm flex flex-col gap-4 bg-stone-900 border border-stone-700 rounded-xl p-5">

        {/* Name */}
        <div>
          <label className="text-stone-500 text-xs uppercase tracking-widest block mb-2">your name</label>
          <input
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-yellow-400"
            placeholder="e.g. Mochi"
            maxLength={16}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
          />
        </div>

        {/* Toggle tabs */}
        <div>
          <label className="text-stone-500 text-xs uppercase tracking-widest block mb-2">pick your look</label>
          <div className="flex rounded-lg overflow-hidden border border-stone-700 mb-3">
            <button
              onClick={() => setPickerMode("character")}
              className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${pickerMode === "character"
                  ? "bg-yellow-400 text-stone-900"
                  : "bg-stone-800 text-stone-400 hover:text-stone-200"
                }`}
            >
              character
            </button>
            <button
              onClick={() => setPickerMode("avatar")}
              className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${pickerMode === "avatar"
                  ? "bg-yellow-400 text-stone-900"
                  : "bg-stone-800 text-stone-400 hover:text-stone-200"
                }`}
            >
              emoji avatar
            </button>
          </div>

          {pickerMode === "character" && (
            <div className="flex gap-3">
              {CHARACTERS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCharacter(c.key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${character === c.key
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-stone-700 bg-stone-800 hover:border-stone-500"
                    }`}
                >
                  <img src={c.url} alt={c.label} className="w-14 h-14 object-contain" />
                  <span className="text-stone-400 text-xs">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {pickerMode === "avatar" && (
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-1.5 rounded-lg border transition-all ${avatar === a
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-stone-700 bg-stone-800 hover:border-stone-500"
                    }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3">
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
