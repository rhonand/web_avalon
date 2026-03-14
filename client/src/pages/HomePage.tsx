

import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import type { Room, CreateRoomResponse, JoinRoomResponse } from "../types/networkTypes";

export default function HomePage() {
  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("connecting socket...");
    socket.connect();

    socket.on("connect", () => {
      console.log("socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("connect_error:", err.message);
      setError(`Connect error: ${err.message}`);
    });

    const onRoomUpdated = (updatedRoom: Room) => {
      console.log("room updated:", updatedRoom);
      setRoom(updatedRoom);
    };

    socket.on("room:updated", onRoomUpdated);

    return () => {
      socket.off("room:updated", onRoomUpdated);
      socket.disconnect();
    };
  }, []);

  const handleCreate = () => {
    console.log("Create clicked", { playerName, connected: socket.connected });
    setError("");

    socket.emit("room:create", { playerName }, (res: CreateRoomResponse) => {
      console.log("room:create ack:", res);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setMyPlayerId(res.playerId);
    });
  };

  const handleJoin = () => {
    console.log("Join clicked", { joinRoomId, playerName, connected: socket.connected });
    setError("");

    socket.emit("room:join", { roomId: joinRoomId, playerName }, (res: JoinRoomResponse) => {
      console.log("room:join ack:", res);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setMyPlayerId(res.playerId);
    });
  };

  if (room) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Room {room.id}</h1>
        <ul>
          {room.players.map((p) => (
            <li key={p.id}>
              {p.name} {p.isHost ? "(Host)" : ""} {p.id === myPlayerId ? "← You" : ""}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "grid", gap: 12, maxWidth: 420 }}>
      <input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Your name"
      />
      <button onClick={handleCreate}>Create Room</button>
      <input
        value={joinRoomId}
        onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
        placeholder="Room ID"
      />
      <button onClick={handleJoin}>Join Room</button>
      {error ? <p>{error}</p> : null}
    </div>
  );
}





/*
// Legacy Local Game

import { useState } from "react";
import PageContainer from "../components/PageContainer";
import PrimaryButton from "../components/PrimaryButton";

type HomePageProps = {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (nickname: string, roomCode: string) => void;
};

function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <PageContainer title="Avalon Web">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code"
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <PrimaryButton
          text="Create Room"
          onClick={() => onCreateRoom(nickname)}
        />

        <PrimaryButton
          text="Join Room"
          onClick={() => onJoinRoom(nickname, roomCode)}
        />
      </div>
    </PageContainer>
  );
}

export default HomePage;
*/