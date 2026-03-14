import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createRoom, getRoom, joinRoom, removePlayerBySocketId } from "./roomStore.js";
import type { ClientToServerEvents, ServerToClientEvents } from "./types.js";

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
      room,
      playerId: player.id,
    });

    io.to(room.id).emit("room:updated", room);
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
      room: result.room,
      playerId: result.player.id,
    });

    io.to(roomId).emit("room:updated", result.room);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);

    const updatedRoom = removePlayerBySocketId(socket.id);
    if (updatedRoom) {
      io.to(updatedRoom.id).emit("room:updated", updatedRoom);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});