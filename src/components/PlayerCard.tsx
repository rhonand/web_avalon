type PlayerCardProps = {
  nickname: string;
  isHost?: boolean;
};

function PlayerCard({ nickname, isHost = false }: PlayerCardProps) {
  return (
    <div
      style={{
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      {nickname} {isHost ? "(Host)" : ""}
    </div>
  );
}

export default PlayerCard;