// src/game/types.ts
// Single source of truth for all shared types.
// Every other file in game/ imports from here — never define types inline elsewhere.

export type PlayerState = "walking" | "sitting";

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  state: PlayerState;
  character: string; // sprite key e.g. "Boy1"
  facing: "left" | "right"; // for sprite flipping
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bench {
  rect: Rect; // drawn furniture rectangle
  sitZone: Rect; // invisible interaction zone in front of the bench
  sitX: number; // where the player's x snaps to when sitting
  sitY: number; // where the player's y snaps to when sitting
}

export interface GameState {
  player: Player;
  benches: Bench[];
  timerMs: number;
  isRunning: boolean;
}

export interface CameraView {
  x: number;
  y: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

export type StateChangeCallback = (
  playerState: PlayerState,
  timerDisplay: string,
) => void;
