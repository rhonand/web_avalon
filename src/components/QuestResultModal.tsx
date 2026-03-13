import "./QuestResultModal.css";

type QuestResultModalProps = {
  isOpen: boolean;
  questNumber: number;
  passed: boolean;
  successCount: number;
  failCount: number;
  onClose: () => void;
};

export default function QuestResultModal({
  isOpen,
  questNumber,
  passed,
  successCount,
  failCount,
  onClose,
}: QuestResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="quest-result-modal-overlay">
      <div className="quest-result-modal">
        <div className="quest-result-modal-title">Quest Result</div>

        <div
          className={`quest-result-status ${passed ? "success" : "fail"}`}
        >
          Quest {questNumber} {passed ? "Succeeded" : "Failed"}
        </div>

        <div className="quest-result-stats">
          <div className="quest-result-stat-row">
            <span className="quest-result-label">Success cards</span>
            <span className="quest-result-value">{successCount}</span>
          </div>

          <div className="quest-result-stat-row">
            <span className="quest-result-label">Fail cards</span>
            <span className="quest-result-value">{failCount}</span>
          </div>
        </div>

        <button className="quest-result-close-button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}