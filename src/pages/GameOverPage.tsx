import PageContainer from "../components/PageContainer";
import type { Room } from "../types/gameTypes";

type GameOverPageProps = {
  room: Room;
  onRestart: () => void;
};

function GameOverPage({ room, onRestart }: GameOverPageProps) {
  const passedCount = room.questDetails.filter((r) => r.passed).length;
  const failedCount = room.questDetails.filter((r) => !r.passed).length;

  const winner = passedCount >= 3 ? "Good" : "Evil";

  return (
    <PageContainer title="Game Over">
      <h2>{winner} Wins!</h2>

      <p>Successful missions: {passedCount}</p>
      <p>Failed missions: {failedCount}</p>

      <div style={{ marginTop: "20px" }}>
        <h3>Mission History</h3>
        <ul>
          {room.questDetails.map((result, index) => (
            <li key={index}>
              Round {result.questRound}: {result.passed ? "Passed" : "Failed"} (
              success {result.successCount}, fail {result.failCount})
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Roles</h3>
        <ul>
          {room.players.map((player) => (
            <li key={player.id}>
              {player.name}: {player.role ?? "Unknown"}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onRestart} style={{ marginTop: "20px" }}>
        Back to Home
      </button>


    </PageContainer>
  );
}

export default GameOverPage;