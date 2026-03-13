import "./VoteModal.css";

type VoteModalProps = {
  isOpen: boolean;
  teamPlayerNames: string[];
  myVote?: "approve" | "reject";
  onApprove: () => void;
  onReject: () => void;
};

export default function VoteModal({
  isOpen,
  teamPlayerNames,
  myVote,
  onApprove,
  onReject,
}: VoteModalProps) {
  if (!isOpen) return null;

  const hasVoted = myVote !== undefined;

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
            {teamPlayerNames.map((name) => (
              <div className="vote-modal-player-chip" key={name}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {!hasVoted ? (
          <div className="vote-modal-actions">
            <button className="vote-button approve" onClick={onApprove}>
              Approve
            </button>

            <button className="vote-button reject" onClick={onReject}>
              Reject
            </button>
          </div>
        ) : (
          <div className="vote-modal-waiting">
            You voted <strong>{myVote}</strong>. Waiting for other players...
          </div>
        )}
      </div>
    </div>
  );
}