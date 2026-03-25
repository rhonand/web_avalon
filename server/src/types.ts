{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

export type CreateRoomResponse =
  | { ok: true; room: Room; playerId: string }
  | { ok: false; message: string };

export type JoinRoomResponse =
  | { ok: true; room: Room; playerId: string }
  | { ok: false; message: string };

export type LeaveRoomResponse =
  | { ok: true }
  | { ok: false; message: string };

export type ClientToServerEvents = {
  "room:create": (payload: { playerName: string }, callback: (response: CreateRoomResponse) => void) => void;
  "room:join": (
    payload: { roomId: string; playerName: string },
    callback: (response: JoinRoomResponse) => void
  ) => void;
  "room:leave": (
    payload: { roomId: string },
    callback: (response: LeaveRoomResponse) => void
  ) => void;
};