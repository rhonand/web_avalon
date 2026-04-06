import "./PlayerSeat.css";
import type { ReactNode } from "react";
import type { Player, SeatMetaInfo } from "../types/gameTypes";
import type { NetworkPlayer } from "../types/networkTypes";

type SeatPlayer = Player | NetworkPlayer;

type PlayerSeatProps = {
  player?: SeatPlayer;
  seatIndex: number;
  isSelected?: boolean;
  isLeader?: boolean;
  isMe?: boolean;
  hasLady?: boolean;
  hasExcalibur?: boolean;
  isClickable?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  privateInfoRevealed: boolean;
  seatMeta?: SeatMetaInfo;
  seatCircleTopLeftOverlay?: ReactNode;
  seatCircleTopRightOverlay?: ReactNode;
  seatCircleBottomRightOverlay?: ReactNode;
  cardOverlay?: ReactNode;
  onClick?: () => void;
};

export default function PlayerSeat({
  player,
  seatIndex,
  isSelected = false,
  isLeader = false,
  isMe = false,
  isClickable = false,
  hasLady = false,
  hasExcalibur = false,
  isDisabled = false,
  disabledReason,
  privateInfoRevealed,
  seatMeta,
  seatCircleTopLeftOverlay,
  seatCircleTopRightOverlay,
  seatCircleBottomRightOverlay,
  cardOverlay,
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
        ${isMe ? "me" : ""}
        ${isDisabled ? "disabled-target" : ""}
        ${hasLady ? "has-lady" : ""}
        ${isClickable ? "clickable" : ""}
        ${!player ? "empty" : "occupied"}`}
      onClick={isClickable && !isDisabled ? onClick : undefined}
      title={isDisabled ? disabledReason : undefined}
    >
      {cardOverlay ? <div className="player-seat-card-overlay">{cardOverlay}</div> : null}

      <div className="player-seat-circle">
        {seatCircleTopLeftOverlay ? (
          <div className="player-seat-circle-overlay player-seat-circle-overlay-top-left">
            {seatCircleTopLeftOverlay}
          </div>
        ) : null}
        {seatCircleTopRightOverlay ? (
          <div className="player-seat-circle-overlay player-seat-circle-overlay-top-right">
            {seatCircleTopRightOverlay}
          </div>
        ) : null}
        {seatCircleBottomRightOverlay ? (
          <div className="player-seat-circle-overlay player-seat-circle-overlay-bottom-right">
            {seatCircleBottomRightOverlay}
          </div>
        ) : null}
        {getSeatLabel()}
      </div>

      <div className="player-seat-main">
        <div className="player-seat-name-row">
          <div className="player-seat-name">
            {player ? player.name : `Seat ${seatIndex + 1}`}
          </div>
        </div>

        <div className="player-seat-identity-row">
          {seatMeta ? (
            <span
              key={`${seatMeta.tone}-${seatMeta.text}`}
              className={`seat-meta-badge ${seatMeta.tone} ${
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
        {hasExcalibur ? (
          <span className="seat-icon" title="Excalibur">
            Sword
          </span>
        ) : null}
      </div>
    </div>
  );
}
