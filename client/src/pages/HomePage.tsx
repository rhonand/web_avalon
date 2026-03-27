import type { RoomView } from "../types/networkTypes";
import PageContainer from "../components/PageContainer";
import PrimaryButton from "../components/PrimaryButton";

type HomePageProps = {
  playerName: string;
  joinRoomId: string;
  room: RoomView | null;
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
  error,
  onPlayerNameChange,
  onJoinRoomIdChange,
  onCreateRoom,
  onJoinRoom,
}: HomePageProps) {
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
          onChange={(e) => onJoinRoomIdChange(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <PrimaryButton text="Create Room" onClick={onCreateRoom} />

        <PrimaryButton text="Join Room" onClick={onJoinRoom} />

        {error ? <p style={{ margin: 0 }}>{error}</p> : null}
      </div>
    </PageContainer>
  );
}
