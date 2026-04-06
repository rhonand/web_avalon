import "./SeatColumn.css";
import type { ReactNode } from "react";
import PlayerSeat from "./PlayerSeat";
import type { Player, Room, SeatMetaInfo } from "../types/gameTypes";
import type { RoomView } from "../types/networkTypes";
import type { PlayerMarkDefinition } from "../types/playerMarks";

type SeatColumnRoom = Room | RoomView;

type SeatColumnProps = {
  seatIndices: number[];
  room: SeatColumnRoom;
  myPlayerId?: string;
  ladyPlayerId?: string | null;
  selectedTeamPlayerIds?: string[];
  leaderPlayerId?: string;
  privateInfoRevealed: boolean;
  leaderBadgeRevealed: boolean;
  onSeatClick?: (playerId: string) => void;
  seatMetaResolver?: (playerId: string) => SeatMetaInfo;
  playerMarkResolver?: (playerId: string) => PlayerMarkDefinition | null;
  disabledPlayerIds?: string[];
  disabledReasonResolver?: (playerId: string) => string | undefined;
};

function LeaderCrownOverlay(): ReactNode {
  return (
    <span
      className="seat-circle-badge seat-circle-badge-leader"
      title="Leader"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="seat-circle-badge-icon">
        <path
          d="M4 18 5.8 8.5l4.1 3.9L12 6l2.1 6.4 4.1-3.9L20 18Z"
          fill="currentColor"
          stroke="rgba(92, 56, 10, 0.5)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <rect
          x="4.5"
          y="18"
          width="15"
          height="2.5"
          rx="1.2"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function SelfMarkerOverlay(): ReactNode {
  return (
    <span className="seat-circle-badge seat-circle-badge-self" title="You" aria-hidden="true">
      <span className="seat-circle-self-text">U</span>
    </span>
  );
}

function PlayerMarkOverlay({
  label,
  tone,
  glyph,
}: {
  label: string;
  tone: PlayerMarkDefinition["tone"];
  glyph?: string;
}): ReactNode {
  return (
    <span
      className={`player-mark-badge player-mark-badge-${tone}`}
      title={label}
      aria-label={label}
    >
      {glyph ? <span className="player-mark-glyph">{glyph}</span> : null}
    </span>
  );
}

export default function SeatColumn({
  seatIndices,
  room,
  myPlayerId,
  ladyPlayerId,
  selectedTeamPlayerIds = [],
  leaderPlayerId,
  privateInfoRevealed,
  leaderBadgeRevealed,
  onSeatClick,
  seatMetaResolver,
  playerMarkResolver,
  disabledPlayerIds = [],
  disabledReasonResolver,
}: SeatColumnProps) {
  function getPlayerAtSeat(
    seatIndex: number
  ): Player | RoomView["players"][number] | undefined {
    return room.players.find((player) => player.seatIndex === seatIndex);
  }

  return (
    <div className="seat-column">
      {seatIndices.map((seatIndex) => {
        const player = getPlayerAtSeat(seatIndex);
        const isSelected =
          player !== undefined && selectedTeamPlayerIds.includes(player.id);
        const isLeader = player !== undefined && player.id === leaderPlayerId;
        const isMe = player !== undefined && player.id === myPlayerId;
        const hasLady = player !== undefined && player.id === ladyPlayerId;
        const isDisabled =
          player !== undefined && disabledPlayerIds.includes(player.id);
        const isClickable = player !== undefined && onSeatClick !== undefined;
        const seatMeta =
          player && seatMetaResolver ? seatMetaResolver(player.id) : null;
        const playerMark =
          player && playerMarkResolver ? playerMarkResolver(player.id) : null;
        const disabledReason =
          player && disabledReasonResolver ? disabledReasonResolver(player.id) : undefined;
        const seatCircleTopLeftOverlay =
          isLeader && leaderBadgeRevealed ? <LeaderCrownOverlay /> : null;
        const seatCircleTopRightOverlay = isMe ? <SelfMarkerOverlay /> : null;
        const seatCircleBottomRightOverlay = playerMark ? (
          <PlayerMarkOverlay
            label={playerMark.label}
            tone={playerMark.tone}
            glyph={playerMark.glyph}
          />
        ) : null;

        return (
          <PlayerSeat
            key={seatIndex}
            player={player}
            seatIndex={seatIndex}
            isSelected={isSelected}
            isLeader={isLeader}
            isMe={isMe}
            hasLady={hasLady}
            isClickable={isClickable}
            isDisabled={isDisabled}
            disabledReason={disabledReason}
            privateInfoRevealed={privateInfoRevealed}
            seatMeta={seatMeta}
            seatCircleTopLeftOverlay={seatCircleTopLeftOverlay}
            seatCircleTopRightOverlay={seatCircleTopRightOverlay}
            seatCircleBottomRightOverlay={seatCircleBottomRightOverlay}
            onClick={() => {
              if (player && onSeatClick) {
                onSeatClick(player.id);
              }
            }}
          />
        );
      })}
    </div>
  );
}
