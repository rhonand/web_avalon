import { toRoomView, type ServerRoom, type ServerRoomPlayer } from "./types/serverTypes.js";

const rooms = new Map<string, ServerRoom>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomCode = "";
  for (let i = 0; i < 6; i += 1) {
    roomCode += chars[Math.floor(Math.random() * chars.length)];
  }
  return roomCode;
}

function generatePlayerId(): string {
  return crypto.randomUUID();
}

function generateBotName(room: ServerRoom): string {
  const botCount = room.players.filter((player) => player.type === "bot").length + 1;
  return `Bot ${botCount}`;
}

function getNextSeatIndex(room: ServerRoom): number {
  return room.players.length;
}

export function createRoom(hostName: string, socketId: string): {
  room: ServerRoom;
  player: ServerRoomPlayer;
} {
  let roomCode = generateRoomCode();
  while (rooms.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const hostPlayer: ServerRoomPlayer = {
    id: generatePlayerId(),
    name: hostName,
    socketId,
    isHost: true,
    type: "human",
    seatIndex: 0,
  };

  const room: ServerRoom = {
    id: roomCode,
    code: roomCode,
    createdAt: Date.now(),
    status: "lobby",
    hostPlayerId: hostPlayer.id,
    activeGameId: null,
    players: [hostPlayer],
  };

  rooms.set(roomCode, room);
  return { room, player: hostPlayer };
}

export function getRoom(roomId: string): ServerRoom | undefined {
  return rooms.get(roomId);
}

export function setRoomInGame(roomId: string, gameId: string): ServerRoom | undefined {
  const room = rooms.get(roomId);
  if (!room) {
    return undefined;
  }

  room.status = "in_game";
  room.activeGameId = gameId;
  return room;
}

export function setRoomBackToLobby(roomId: string): ServerRoom | undefined {
  const room = rooms.get(roomId);
  if (!room) {
    return undefined;
  }

  room.status = "lobby";
  room.activeGameId = null;
  return room;
}

export function getRoomView(roomId: string) {
  const room = rooms.get(roomId);
  return room ? toRoomView(room) : undefined;
}

export function joinRoom(
  roomId: string,
  playerName: string,
  socketId: string
): { room?: ServerRoom; player?: ServerRoomPlayer; error?: string } {
  const room = rooms.get(roomId);

  if (!room) {
    return { error: "Room not found." };
  }

  const trimmedName = playerName.trim();
  if (!trimmedName) {
    return { error: "Player name is required." };
  }

  const duplicateName = room.players.some(
    (player) => player.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (duplicateName) {
    return { error: "That name is already taken in this room." };
  }

  const player: ServerRoomPlayer = {
    id: generatePlayerId(),
    name: trimmedName,
    socketId,
    isHost: false,
    type: "human",
    seatIndex: getNextSeatIndex(room),
  };

  room.players.push(player);
  return { room, player };
}

export function addBotToRoom(roomId: string): { room?: ServerRoom; player?: ServerRoomPlayer; error?: string } {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "Room not found." };
  }

  if (room.players.length >= 10) {
    return { error: "Room is full." };
  }

  const botPlayer: ServerRoomPlayer = {
    id: generatePlayerId(),
    name: generateBotName(room),
    socketId: `bot:${crypto.randomUUID()}`,
    isHost: false,
    type: "bot",
    seatIndex: getNextSeatIndex(room),
  };

  room.players.push(botPlayer);
  return { room, player: botPlayer };
}

export function fillRoomWithBots(roomId: string): { room?: ServerRoom; error?: string } {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "Room not found." };
  }

  while (room.players.length < 10) {
    const result = addBotToRoom(roomId);
    if (result.error) {
      return { error: result.error };
    }
  }

  return { room };
}

export function removePlayerBySocketId(socketId: string): ServerRoom | undefined {
  for (const room of rooms.values()) {
    const index = room.players.findIndex((player) => player.socketId === socketId);
    if (index === -1) {
      continue;
    }

    const [removedPlayer] = room.players.splice(index, 1);

    room.players.forEach((player, seatIndex) => {
      player.seatIndex = seatIndex;
    });

    if (removedPlayer.id === room.hostPlayerId && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostPlayerId = room.players[0].id;
    }

    if (room.players.length === 0) {
      rooms.delete(room.id);
      return undefined;
    }

    return room;
  }

  return undefined;
}
