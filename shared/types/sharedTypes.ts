export type LobbyPlayer = {
  id: string;
  name: string;
  isHost: boolean;
};

export type LobbyRoom = {
  id: string;
  createdAt: number;
  phase: "lobby" | "initializing" | "discussion";
  players: LobbyPlayer[];
};

export type CreateRoomResponse =
  | { ok: true; room: LobbyRoom; playerId: string }
  | { ok: false; message: string };

export type JoinRoomResponse =
  | { ok: true; room: LobbyRoom; playerId: string }
  | { ok: false; message: string };

export type LeaveRoomResponse =
  | { ok: true }
  | { ok: false; message: string };