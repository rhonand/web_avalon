import "./PlayerInfoModal.css";
import type { Player } from "../types/gameTypes";
import type { VisiblePlayerInfo } from "../engine/visibilityEngine";
import type { NetworkPlayer } from "../types/networkTypes";
import type { PlayerMarkDefinition } from "../types/playerMarks";

type InspectablePlayer = Player | NetworkPlayer;

type PlayerInfoModalProps = {
  isOpen: boolean;
  player?: InspectablePlayer;
  visibleInfo?: VisiblePlayerInfo | null;
  currentMark?: PlayerMarkDefinition | null;
  availableMarks?: PlayerMarkDefinition[];
  roleSummary?: string[];
  onSelectMark?: (markId: string) => void;
  onClearMark?: () => void;
  onClose: () => void;
};

function MarkPreview({ mark }: { mark: PlayerMarkDefinition }) {
  return (
    <span
      className={`player-info-mark-preview player-info-mark-preview-${mark.tone}`}
      aria-hidden="true"
    >
      {mark.glyph ? <span className="player-info-mark-glyph">{mark.glyph}</span> : null}
    </span>
  );
}

export default function PlayerInfoModal({
  isOpen,
  player,
  visibleInfo,
  currentMark,
  availableMarks = [],
  roleSummary = [],
  onSelectMark,
  onClearMark,
  onClose,
}: PlayerInfoModalProps) {
  if (!isOpen || !player) return null;

  return (
    <div className="player-info-modal-overlay" onClick={onClose}>
      <div className="player-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="player-info-modal-title">
          {visibleInfo?.displayName ?? player.name}
        </div>

        <div className="player-info-modal-body">
          {visibleInfo?.lines?.length ? (
            visibleInfo.lines.slice(0, 1).map((line, index) => <p key={index}>{line}</p>)
          ) : (
            <p>No special information.</p>
          )}
        </div>

        {roleSummary.length > 0 ? (
          <div className="player-info-modal-helper">
            Available roles this game: {roleSummary.join(", ")}
          </div>
        ) : null}

        {availableMarks.length > 0 ? (
          <>
            <div className="player-info-modal-mark-grid">
              {availableMarks.map((mark) => {
                const isSelected = currentMark?.id === mark.id;

                return (
                  <button
                    key={mark.id}
                    type="button"
                    className={`player-info-mark-option ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelectMark?.(mark.id)}
                  >
                    <MarkPreview mark={mark} />
                    <span>{mark.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="player-info-modal-clear"
              onClick={() => onClearMark?.()}
            >
              Clear Mark
            </button>
          </>
        ) : null}

        <button type="button" className="player-info-modal-close" onClick={onClose}>
          Return
        </button>
      </div>
    </div>
  );
}
