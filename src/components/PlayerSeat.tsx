import "./PlayerSeat.css";
import type { Player, SeatMetaInfo } from "../types/gameTypes";

type PlayerSeatProps = {
  player?: Player;
  seatIndex: number;
  isSelected?: boolean;
  isLeader?: boolean;
  hasLady?: boolean;
  hasExcalibur?: boolean;
  isClickable?: boolean;
  privateInfoRevealed: boolean;
  leaderBadgeRevealed: boolean;
  seatMeta?: SeatMetaInfo;
  onClick?: () => void;
};

export default function PlayerSeat({
  player,
  seatIndex,
  isSelected = false,
  isLeader = false,
  isClickable = false,
  hasLady = false,
  hasExcalibur = false,
  privateInfoRevealed,
  leaderBadgeRevealed,
  seatMeta,
  onClick,
}: PlayerSeatProps) {
  function getSeatLabel() {
    if (!player) return "";
    return player.seatIndex + 1;
  }

  return (
    <div
      className={`player-seat
        ${isSelected ? "selected" : ""}
        ${isLeader ? "leader" : ""}
        ${isClickable ? "clickable" : ""}
        ${!player ? "empty" : "occupied"}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="player-seat-circle">
        {getSeatLabel()}
      </div>

       <div className="player-seat-main">
        <div className="player-seat-name">
          {player ? player.name : `Seat ${seatIndex + 1}`}
        </div>

        <div className="player-seat-identity-row">
          {seatMeta ? (
            <span className={`seat-meta-badge ${seatMeta.tone} ${
              privateInfoRevealed ? "revealed" : ""
            }`}
            
            >
              {seatMeta.text}
            </span>
          ) : (
            <span className="seat-meta-placeholder" />
          )}
        </div>
      </div>

      <div className="player-seat-icons">
        {isLeader && leaderBadgeRevealed && <span className="seat-icon" title="Leader">👑</span>}
        {hasLady && <span className="seat-icon" title="Lady of the Lake">🪞</span>}
        {hasExcalibur && <span className="seat-icon" title="Excalibur">🗡️</span>}
      </div>
    </div>
  );
}