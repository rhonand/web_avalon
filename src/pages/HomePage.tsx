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