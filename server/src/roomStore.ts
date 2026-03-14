import type { Room, Player } from "./types.js";

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";
  for (let i = 0; i < 6; i += 1) {
    roomId += chars[Math.floor(Math.random() * chars.length)];
  }
  return roomId;
}

function generatePlayerId(): string {
  return crypto.randomUUID();
}

export function createRoom(hostName: string, socketId: string): { room: Room; player: Player } {
  let roomId = generateRoomId();
  while (rooms.has(roomId)) {
    roomId = generateRoomId();
  }

  const hostPlayer: Player = {
    id: generatePlayerId(),
    name: hostName,
    socketId,
    isHost: true,
  };

  const room: Room = {
    id: roomId,
    players: [hostPlayer],
    createdAt: Date.now(),
  };

  rooms.set(roomId, room);
  return { room, player: hostPlayer };
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, playerName: string, socketId: string): { room?: Room; player?: Player; error?: string } {
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

  const player: Player = {
    id: generatePlayerId(),
    name: trimmedName,
    socketId,
    isHost: false,
  };

  room.players.push(player);
  return { room, player };
}

export function removePlayerBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    const index = room.players.findIndex((player) => player.socketId === socketId);
    if (index === -1) continue;

    const [removedPlayer] = room.players.splice(index, 1);

    if (removedPlayer.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    if (room.players.length === 0) {
      rooms.delete(room.id);
      return undefined;
    }

    return room;
  }

  return undefined;
}