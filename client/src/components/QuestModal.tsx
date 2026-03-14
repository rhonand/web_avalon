import "./QuestModal.css";

type QuestModalProps = {
  isOpen: boolean;
  amOnTeam: boolean;
  myMissionAction?: "success" | "fail";
  canFail: boolean;
  teamPlayerNames: string[];
  onSuccess: () => void;
  onFail: () => void;
};

export default function QuestModal({
  isOpen,
  amOnTeam,
  myMissionAction,
  canFail,
  teamPlayerNames,
  onSuccess,
  onFail,
}: QuestModalProps) {
  if (!isOpen) return null;

  const hasSubmitted = myMissionAction !== undefined;

  return (
    <div className="quest-modal-overlay">
      <div className="quest-modal">
        <div className="quest-modal-title">Quest</div>

        <div className="quest-modal-subtitle">
          {amOnTeam
            ? "Choose your quest action."
            : "You are not on this quest team."}
        </div>

        <div className="quest-modal-section">
          <div className="quest-modal-section-title">Quest Team</div>

          <div className="quest-modal-team-list">
            {teamPlayerNames.map((name) => (
              <div className="quest-modal-player-chip" key={name}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {!amOnTeam ? (
          <div className="quest-modal-waiting">
            Waiting for quest team members to submit their actions...
          </div>
        ) : !hasSubmitted ? (
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
        ) : (
          <div className="quest-modal-waiting">
            You submitted <strong>{myMissionAction}</strong>. Waiting for other
            team members...
          </div>
        )}
      </div>
    </div>
  );
}