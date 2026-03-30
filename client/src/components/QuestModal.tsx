import "./QuestModal.css";

type QuestModalProps = {
  isOpen: boolean;
  amOnTeam: boolean;
  myMissionAction?: "success" | "fail";
  canFail: boolean;
  teamPlayers: Array<{
    label: string;
    visualKind: "default" | "self" | "good" | "evil" | "merlin-maybe";
  }>;
  onSuccess: () => void;
  onFail: () => void;
};

export default function QuestModal({
  isOpen,
  canFail,
  teamPlayers,
  onSuccess,
  onFail,
}: QuestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="quest-modal-overlay">
      <div className="quest-modal">
        <div className="quest-modal-title">Quest</div>

        <div className="quest-modal-subtitle">Choose your quest action.</div>

        <div className="quest-modal-section">
          <div className="quest-modal-section-title">Quest Team</div>

          <div className="quest-modal-team-list">
            {teamPlayers.map((player) => (
              <div
                className={`quest-modal-player-chip quest-chip-${player.visualKind}`}
                key={`${player.label}-${player.visualKind}`}
              >
                {player.label}
              </div>
            ))}
          </div>
        </div>

        <div className="quest-modal-actions">
          <button className="quest-button success" onClick={onSuccess}>
            Success
          </button>

          <button
            className="quest-button fail"
            onClick={onFail}
            disabled={!canFail}
            title={!canFail ? "Good-side players cannot play Fail." : ""}
          >
            Fail
          </button>
        </div>
      </div>
    </div>
  );
}
