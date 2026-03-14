import "./SeatColumn.css";
import PlayerSeat from "./PlayerSeat";
import type { Room, Player, SeatMetaInfo } from "../types/gameTypes";

type SeatColumnProps = {
  seatIndices: number[];
  room: Room;
  selectedTeamPlayerIds?: string[];
  leaderPlayerId?: string;
  privateInfoRevealed: boolean;
  leaderBadgeRevealed: boolean;
  onSeatClick?: (playerId: string) => void;
  seatMetaResolver?: (playerId: string) => SeatMetaInfo;
};

export default function SeatColumn({
  seatIndices,
  room,
  selectedTeamPlayerIds = [],
  leaderPlayerId,
  privateInfoRevealed,
  leaderBadgeRevealed,
  onSeatClick,
  seatMetaResolver,
}: SeatColumnProps) {
  function getPlayerAtSeat(seatIndex: number): Player | undefined {
    return room.players.find((player) => player.seatIndex === seatIndex);
  }

  return (
    <div className="seat-column">
      {seatIndices.map((seatIndex) => {
        const player = getPlayerAtSeat(seatIndex);
        const isSelected =
          player !== undefined && selectedTeamPlayerIds.includes(player.id);
        const isLeader = player !== undefined && player.id === leaderPlayerId;
        const isClickable = player !== undefined && onSeatClick !== undefined;
        const seatMeta =
          player && seatMetaResolver ? seatMetaResolver(player.id) : null;
          

        return (
          <PlayerSeat
            key={seatIndex}
            player={player}
            seatIndex={seatIndex}
            isSelected={isSelected}
            isLeader={isLeader}
            isClickable={isClickable}
            privateInfoRevealed={privateInfoRevealed}
            leaderBadgeRevealed={leaderBadgeRevealed}
            seatMeta={seatMeta}
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