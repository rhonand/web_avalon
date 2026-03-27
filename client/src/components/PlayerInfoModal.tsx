import "./PlayerInfoModal.css";
import type { Player } from "../types/gameTypes";
import type { VisiblePlayerInfo } from "../engine/visibilityEngine";
import type { NetworkPlayer } from "../types/networkTypes";

type InspectablePlayer = Player | NetworkPlayer;

type PlayerInfoModalProps = {
  isOpen: boolean;
  player?: InspectablePlayer;
  visibleInfo?: VisiblePlayerInfo | null;
  onClose: () => void;
};

export default function PlayerInfoModal({
  isOpen,
  player,
  visibleInfo,
  onClose,
}: PlayerInfoModalProps) {
  if (!isOpen || !player) return null;

   return (
    <div className="player-info-modal-overlay" onClick={onClose}>
      <div
        className="player-info-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="player-info-modal-title">
          {visibleInfo?.displayName ?? player.name}
        </div>

        <div className="player-info-modal-body">
          {visibleInfo?.lines?.length ? (
            visibleInfo.lines.map((line, index) => <p key={index}>{line}</p>)
          ) : (
            <p>Placeholder</p>
          )}
        </div>

        <button className="player-info-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
