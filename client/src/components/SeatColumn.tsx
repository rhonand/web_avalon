import "./SeatColumn.css";
import type { ReactNode } from "react";
import PlayerSeat from "./PlayerSeat";
import type { Player, Room, SeatMetaInfo } from "../types/gameTypes";
import type { RoomView } from "../types/networkTypes";

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
        const isClickable = player !== undefined && onSeatClick !== undefined;
        const seatMeta =
          player && seatMetaResolver ? seatMetaResolver(player.id) : null;
        const seatCircleTopLeftOverlay =
          isLeader && leaderBadgeRevealed ? <LeaderCrownOverlay /> : null;
        const seatCircleBottomRightOverlay = isMe ? <SelfMarkerOverlay /> : null;

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
            privateInfoRevealed={privateInfoRevealed}
            seatMeta={seatMeta}
            seatCircleTopLeftOverlay={seatCircleTopLeftOverlay}
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
