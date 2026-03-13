type PrimaryButtonProps = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
};

function PrimaryButton({
  text,
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
        fontWeight: 600,
        background: disabled
          ? "#64748b"
          : "linear-gradient(to right, #2563eb, #1d4ed8)",
        color: "white",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {text}
    </button>
  );
}

export default PrimaryButton;