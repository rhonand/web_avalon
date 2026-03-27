import "./LadyResultModal.css";

type LadyResultModalProps = {
  isOpen: boolean;
  resultText: string;
  onClose: () => void;
};

export default function LadyResultModal({
  isOpen,
  resultText,
  onClose,
}: LadyResultModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="lady-result-modal-overlay">
      <div className="lady-result-modal">
        <div className="lady-result-modal-title">Lady of the Lake</div>

        <div className="lady-result-modal-body">{resultText}</div>

        <button className="lady-result-close-button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
