export type RoomId = string;

export interface LocalPlayer {
  id: string;
  name: string;
  avatar: string;
}

export interface LobbyState {
  phase: "lobby" | "game";
  localPlayer: LocalPlayer | null;
  roomId: RoomId | null;
  mode: "create" | "join" | "random" | null;
}
