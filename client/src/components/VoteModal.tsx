import "./VoteModal.css";

type VoteModalProps = {
  isOpen: boolean;
  teamPlayers: Array<{
    label: string;
    visualKind: "default" | "self" | "good" | "evil" | "merlin-maybe";
  }>;
  myVote?: "approve" | "reject";
  onApprove: () => void;
  onReject: () => void;
};

export default function VoteModal({
  isOpen,
  teamPlayers,
  onApprove,
  onReject,
}: VoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="vote-modal-overlay">
      <div className="vote-modal">
        <div className="vote-modal-title">Vote</div>

        <div className="vote-modal-subtitle">
          Do you approve this team?
        </div>

        <div className="vote-modal-section">
          <div className="vote-modal-section-title">Proposed Team</div>

          <div className="vote-modal-team-list">
            {teamPlayers.map((player) => (
              <div
                className={`vote-modal-player-chip vote-chip-${player.visualKind}`}
                key={`${player.label}-${player.visualKind}`}
              >
                {player.label}
              </div>
            ))}
          </div>
        </div>

        <div className="vote-modal-actions">
          <button className="vote-button approve" onClick={onApprove}>
            Approve
          </button>

          <button className="vote-button reject" onClick={onReject}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
