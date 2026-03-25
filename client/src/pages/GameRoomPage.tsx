import { useState } from "react";
import "./GameRoomPage.css";

import SeatColumn from "../components/SeatColumn";
import RoomCenterPanel from "../components/RoomCenterPanel";
import PlayerInfoModal from "../components/PlayerInfoModal";

import type { Room } from "../types/gameTypes";

type GameRoomPageProps = {
  room: Room | null;
  myPlayerId: string;
  onLeaveRoom: (playerId: string) => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onFillAllSeatsWithBots: () => void;
};

export default function GameRoomPage({
  room,
  myPlayerId,
  onLeaveRoom,
  onStartGame,
  onAddBot,
  onFillAllSeatsWithBots,
}: GameRoomPageProps) {
  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  const me = room.players.find((player) => player.id === myPlayerId);
  const amIHost = me?.isHost ?? false;

  const inspectedPlayer = room.players.find(
    (player) => player.id === inspectedPlayerId
  );

  function handleSeatClick(playerId: string) {
    setInspectedPlayerId(playerId);
  }

  return (
    <div className="game-room-page">
      <div className="game-room-topbar">
        <div className="game-room-room-code">Room: {room.code}</div>
        <div className="game-room-status">
          Players: {room.players.length} / 10
        </div>
      </div>

      <div className="game-room-layout">
        <SeatColumn
          seatIndices={[0, 1, 2, 3, 4]}
          room={room}
          selectedTeamPlayerIds={[]}
          leaderPlayerId={undefined}
          onSeatClick={handleSeatClick}
        />

        <RoomCenterPanel
          room={room}
          myPlayerId={myPlayerId}
          amIHost={amIHost}
          onLeaveRoom={() => onLeaveRoom(myPlayerId)}
          onStartGame={onStartGame}
          onAddBot={onAddBot}
          onFillAllSeatsWithBots={onFillAllSeatsWithBots}
        />

        <SeatColumn
          seatIndices={[5, 6, 7, 8, 9]}
          room={room}
          selectedTeamPlayerIds={[]}
          leaderPlayerId={undefined}
          onSeatClick={handleSeatClick}
        />
      </div>

      <PlayerInfoModal
        isOpen={!!inspectedPlayer}
        player={inspectedPlayer}
        onClose={() => setInspectedPlayerId(null)}
      />
    </div>
  );
}