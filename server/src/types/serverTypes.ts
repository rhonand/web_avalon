export type ServerPlayer = {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  role?: string;
};

export type ServerRoom = {
  id: string;
  createdAt: number;
  phase: "lobby" | "initializing" | "discussion";
  players: ServerPlayer[];
};