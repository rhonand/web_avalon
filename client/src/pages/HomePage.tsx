


import type { Room } from "../types/networkTypes";
import PageContainer from "../components/PageContainer";
import PrimaryButton from "../components/PrimaryButton";

type HomePageProps = {
  playerName: string;
  joinRoomId: string;
  room: Room | null;
  myPlayerId: string | null;
  error: string;
  onPlayerNameChange: (value: string) => void;
  onJoinRoomIdChange: (value: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

export default function HomePage({
  playerName,
  joinRoomId,
  room,
  myPlayerId,
  error,
  onPlayerNameChange,
  onJoinRoomIdChange, 
  onCreateRoom, 
  onJoinRoom 
}: HomePageProps) {
 

  if (room) {
    
  return (
    <PageContainer title="Avalon Web">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          placeholder="Enter your nickname"
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <input
          value={joinRoomId}
          onChange={(e) => onJoinRoomIdChange(e.target.value)}
          placeholder="Enter room code"
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <PrimaryButton
          text="Create Room"
          onClick={() => onCreateRoom()}
        />

        <PrimaryButton
          text="Join Room"
          onClick={() => onJoinRoom()}
        />
      </div>
    </PageContainer>
  );


  /*
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

  */
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