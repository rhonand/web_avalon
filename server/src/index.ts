import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  advanceGameToDiscussion,
  continueAfterLadyResult,
  applyMissionTimeout,
  applyVoteTimeout,
  continueAfterQuestResult,
  createGame,
  getGameByRoomId,
  getPendingBotAction,
  proposeTeam,
  removeGameByRoomId,
  returnGameToRoom,
  startTeamBuilding,
  submitAssassination,
  submitLadyTest,
  submitQuestAction,
  submitVote,
} from "./gameStore.js";
import {
  addBotToRoom,
  createRoom,
  fillRoomWithBots,
  getRoom,
  joinRoom,
  removePlayerBySocketId,
  setRoomBackToLobby,
  setRoomInGame,
} from "./roomStore.js";
import type { ClientToServerEvents, ServerToClientEvents } from "./types.js";
import { toGameView, toRoomView } from "./types/serverTypes.js";

console.log("server entry: current index ts loaded");

const app = express();
app.use(cors());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const botActionTimers = new Map<string, ReturnType<typeof setTimeout>>();
const gameOverTimers = new Map<string, ReturnType<typeof setTimeout>>();
const phaseTimers = new Map<string, { phase: string; timer: ReturnType<typeof setTimeout> }>();

function clearBotTimer(roomId: string) {
  const existingTimer = botActionTimers.get(roomId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    botActionTimers.delete(roomId);
  }
}

function clearGameOverTimer(roomId: string) {
  const existingTimer = gameOverTimers.get(roomId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    gameOverTimers.delete(roomId);
  }
}

function clearPhaseTimer(roomId: string) {
  const existing = phaseTimers.get(roomId);
  if (existing) {
    clearTimeout(existing.timer);
    phaseTimers.delete(roomId);
  }
}

function getPhaseTimerKeyForGame(game: NonNullable<ReturnType<typeof getGameByRoomId>>): string {
  if (game.phase === "lady") {
    return `lady:${game.ladyStage ?? "idle"}`;
  }

  return game.phase;
}

function getPlayerIdBySocket(roomId: string, socketId: string): string | undefined {
  const room = getRoom(roomId);
  return room?.players.find((player) => player.socketId === socketId)?.id;
}

function emitRoomUpdate(roomId: string) {
  const room = getRoom(roomId);
  if (!room) {
    return;
  }

  io.to(roomId).emit("room:updated", toRoomView(room));
}

function scheduleBotAction(roomId: string) {
  clearBotTimer(roomId);

  const room = getRoom(roomId);
  if (!room) {
    return;
  }

  const botAction = getPendingBotAction(room);
  if (!botAction) {
    return;
  }

  const timer = setTimeout(() => {
    botActionTimers.delete(roomId);
    botAction();
    emitGameUpdate(roomId);
  }, 800);

  botActionTimers.set(roomId, timer);
}

function emitGameUpdate(roomId: string) {
  const room = getRoom(roomId);
  const game = getGameByRoomId(roomId);
  if (!room || !game) {
    clearBotTimer(roomId);
    clearGameOverTimer(roomId);
    clearPhaseTimer(roomId);
    return;
  }

  for (const player of room.players) {
    if (player.type === "human") {
      io.to(player.socketId).emit("game:updated", toGameView(game, room, player.id));
    }
  }

  if (game.phase === "gameOver") {
    clearPhaseTimer(roomId);
    if (!gameOverTimers.has(roomId)) {
      const timer = setTimeout(() => {
        gameOverTimers.delete(roomId);
        destroyGameAndReturnToRoom(roomId);
      }, 10000);

      gameOverTimers.set(roomId, timer);
    }

    clearBotTimer(roomId);
    return;
  }

  clearGameOverTimer(roomId);
  const phaseTimerKey = getPhaseTimerKeyForGame(game);
  const existingPhaseTimer = phaseTimers.get(roomId);
  if (existingPhaseTimer && existingPhaseTimer.phase !== phaseTimerKey) {
    clearPhaseTimer(roomId);
  }

  if (!phaseTimers.has(roomId)) {
    if (game.phase === "vote") {
      const timer = setTimeout(() => {
        phaseTimers.delete(roomId);
        applyVoteTimeout(roomId);
        emitGameUpdate(roomId);
      }, 30000);
      phaseTimers.set(roomId, { phase: phaseTimerKey, timer });
    } else if (game.phase === "mission") {
      const timer = setTimeout(() => {
        phaseTimers.delete(roomId);
        applyMissionTimeout(roomId);
        emitGameUpdate(roomId);
      }, 30000);
      phaseTimers.set(roomId, { phase: phaseTimerKey, timer });
    } else if (game.phase === "questResult") {
      const timer = setTimeout(() => {
        phaseTimers.delete(roomId);
        continueAfterQuestResult(roomId);
        emitGameUpdate(roomId);
      }, 5000);
      phaseTimers.set(roomId, { phase: phaseTimerKey, timer });
    } else if (game.phase === "lady" && game.ladyStage === "result") {
      const timer = setTimeout(() => {
        phaseTimers.delete(roomId);
        continueAfterLadyResult(roomId);
        emitGameUpdate(roomId);
      }, 5000);
      phaseTimers.set(roomId, { phase: phaseTimerKey, timer });
    }
  }

  scheduleBotAction(roomId);
}

function destroyGameAndReturnToRoom(roomId: string) {
  clearBotTimer(roomId);
  clearGameOverTimer(roomId);
  clearPhaseTimer(roomId);
  returnGameToRoom(roomId);
  const room = setRoomBackToLobby(roomId);
  if (!room) {
    return;
  }

  io.to(roomId).emit("room:updated", toRoomView(room));
  io.to(roomId).emit("game:destroyed", { roomId });
}

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("room:create", (payload, callback) => {
    const playerName = payload.playerName.trim();

    if (!playerName) {
      callback({ ok: false, message: "Player name is required." });
      return;
    }

    const { room, player } = createRoom(playerName, socket.id);
    socket.join(room.id);

    callback({
      ok: true,
      room: toRoomView(room),
      playerId: player.id,
    });

    emitRoomUpdate(room.id);
  });

  socket.on("room:join", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerName = payload.playerName.trim();
    const result = joinRoom(roomId, playerName, socket.id);

    if (result.error || !result.room || !result.player) {
      callback({
        ok: false,
        message: result.error ?? "Failed to join room.",
      });
      return;
    }

    socket.join(roomId);

    callback({
      ok: true,
      room: toRoomView(result.room),
      playerId: result.player.id,
    });

    emitRoomUpdate(roomId);
  });

  socket.on("room:add_bot", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      callback({ ok: false, message: "Room not found." });
      return;
    }

    const playerId = getPlayerIdBySocket(roomId, socket.id);
    if (playerId !== room.hostPlayerId) {
      callback({ ok: false, message: "Only the host can add bots." });
      return;
    }

    const result = addBotToRoom(roomId);
    if (result.error || !result.room) {
      callback({ ok: false, message: result.error ?? "Failed to add bot." });
      return;
    }

    callback({ ok: true, room: toRoomView(result.room) });
    emitRoomUpdate(roomId);
  });

  socket.on("room:fill_bots", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      callback({ ok: false, message: "Room not found." });
      return;
    }

    const playerId = getPlayerIdBySocket(roomId, socket.id);
    if (playerId !== room.hostPlayerId) {
      callback({ ok: false, message: "Only the host can add bots." });
      return;
    }

    const result = fillRoomWithBots(roomId);
    if (result.error || !result.room) {
      callback({ ok: false, message: result.error ?? "Failed to fill room with bots." });
      return;
    }

    callback({ ok: true, room: toRoomView(result.room) });
    emitRoomUpdate(roomId);
  });

  socket.on("room:leave", (_payload, callback) => {
    const updatedRoom = removePlayerBySocketId(socket.id);

    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.leave(roomId);
      }
    }

    callback({ ok: true });

    if (!updatedRoom) {
      return;
    }

    emitRoomUpdate(updatedRoom.id);

    if (updatedRoom.players.length < 5 && updatedRoom.activeGameId) {
      destroyGameAndReturnToRoom(updatedRoom.id);
    }
  });

  socket.on("game:start", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const room = getRoom(roomId);
    if (!room) {
      callback({ ok: false, message: "Room not found." });
      return;
    }

    const requestingPlayer = room.players.find((player) => player.socketId === socket.id);
    if (!requestingPlayer) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    if (requestingPlayer.id !== room.hostPlayerId) {
      callback({ ok: false, message: "Only the host can start the game." });
      return;
    }

    if (room.players.length < 5) {
      callback({ ok: false, message: "At least 5 players are required to start." });
      return;
    }

    if (room.activeGameId) {
      callback({ ok: false, message: "A game is already running for this room." });
      return;
    }

    const game = createGame(room);
    const updatedRoom = setRoomInGame(room.id, game.id);
    if (!updatedRoom) {
      callback({ ok: false, message: "Failed to update room state." });
      return;
    }

    callback({
      ok: true,
      room: toRoomView(updatedRoom),
      game: toGameView(game, updatedRoom, requestingPlayer.id),
    });

    emitRoomUpdate(roomId);
    emitGameUpdate(roomId);

    setTimeout(() => {
      const advancedGame = advanceGameToDiscussion(roomId);
      if (!advancedGame) {
        return;
      }

      emitGameUpdate(roomId);
    }, 2400);
  });

  socket.on("game:start_team_building", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = startTeamBuilding(roomId, playerId);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:propose_team", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = proposeTeam(roomId, playerId, payload.teamPlayerIds);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:vote", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = submitVote(roomId, playerId, payload.vote);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:quest_action", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = submitQuestAction(roomId, playerId, payload.action);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:lady_test", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = submitLadyTest(roomId, playerId, payload.targetPlayerId);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:assassinate", (payload, callback) => {
    const roomId = payload.roomId.trim().toUpperCase();
    const playerId = getPlayerIdBySocket(roomId, socket.id);

    if (!playerId) {
      callback({ ok: false, message: "Player not found in room." });
      return;
    }

    const result = submitAssassination(roomId, playerId, payload.targetPlayerId);
    if (result.error) {
      callback({ ok: false, message: result.error });
      return;
    }

    callback({ ok: true });
    emitGameUpdate(roomId);
  });

  socket.on("game:continue_after_quest_result", (payload, callback) => {
    callback({ ok: true });
  });

  socket.on("game:return_to_room", (payload, callback) => {
    callback({ ok: true });
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);

    const updatedRoom = removePlayerBySocketId(socket.id);
    if (!updatedRoom) {
      return;
    }

    emitRoomUpdate(updatedRoom.id);

    if (updatedRoom.players.length < 5 && updatedRoom.activeGameId) {
      destroyGameAndReturnToRoom(updatedRoom.id);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
