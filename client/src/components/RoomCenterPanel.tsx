import "./RoomCenterPanel.css";
import type { Room } from "../types/gameTypes";

type RoomCenterPanelProps = {
  room: Room;
  myPlayerId: string;
  amIHost: boolean;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onFillAllSeatsWithBots: () => void;
};

export default function RoomCenterPanel({
  room,
  myPlayerId,
  amIHost,
  onLeaveRoom,
  onStartGame,
  onAddBot,
  onFillAllSeatsWithBots,
}: RoomCenterPanelProps) {
  const hostPlayer = room.players.find((player) => player.isHost);
  const me = room.players.find((player) => player.id === myPlayerId);

  return (
    <div className="room-center-panel">
      <div className="room-card">
        <div className="room-header">
          <h2 className="room-title">Room</h2>
          <div className="room-phase-badge">Waiting</div>
        </div>

        <div className="room-info-grid">
          <div className="room-info-item">
            <div className="room-info-label">Room Code</div>
            <div className="room-info-value">{room.code}</div>
          </div>

          <div className="room-info-item">
            <div className="room-info-label">Players</div>
            <div className="room-info-value">{room.players.length} / 10</div>
          </div>

          <div className="room-info-item">
            <div className="room-info-label">Host</div>
            <div className="room-info-value">{hostPlayer?.name ?? "-"}</div>
          </div>

          <div className="room-info-item">
            <div className="room-info-label">You</div>
            <div className="room-info-value">
              {me?.name ?? "-"} {amIHost ? "(Host)" : ""}
            </div>
          </div>
        </div>

        <div className="room-section">
          <div className="room-section-title">Room Status</div>
          <div className="room-body-text">
            {amIHost
              ? "You are the host. Wait for players to join, then start the game."
              : "Waiting for the host to start the game."}
          </div>
        </div>

        <div className="room-action-section">
          <button className="room-button secondary" onClick={onLeaveRoom}>
            Leave Room
          </button>

          {amIHost && (
            <>
              <button className="room-button primary" onClick={onStartGame}>
                Start Game
              </button>

              <button className="room-button secondary" onClick={onAddBot}>
                Add One Bot
              </button>

              <button
                className="room-button secondary"
                onClick={onFillAllSeatsWithBots}
              >
                Fill All Seats with Bots
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}