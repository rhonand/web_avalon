export type Player = {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
};

export type Page =
  | "home"
  | "room"
  | "game"
  | "gameOver"

export type Phase =
  | "initializing"
  | "discussion"
  | "vote"
  | "mission"
  | "questResult"
  | "gameOver";

export type ProposalStage = "discussion" | "teamBuilding";


export type Room = {
  id: string;
  players: Player[];
  createdAt: number;
  phase: Phase;
};

export type CreateRoomResponse =
  | { ok: true; room: Room; playerId: string }
  | { ok: false; message: string };

export type JoinRoomResponse =
  | { ok: true; room: Room; playerId: string }
  | { ok: false; message: string };