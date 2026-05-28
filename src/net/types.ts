export type RoomId = string;

export interface LocalPlayer {
  id: string;
  name: string;
  avatar: string;
  character: string; // "Boy1" | "Boy2" | "Girl1" | "Girl2"
}

export interface LobbyState {
  phase: "lobby" | "game";
  localPlayer: LocalPlayer | null;
  roomId: RoomId | null;
  mode: "create" | "join" | "random" | null;
}
