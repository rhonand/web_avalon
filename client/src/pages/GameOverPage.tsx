import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/PageContainer";
import type { GameStateView } from "../types/networkTypes";

type GameOverPageProps = {
  room: GameStateView;
  error?: string;
  onReturnToRoom: () => void;
};

function GameOverPage({ room, error, onReturnToRoom }: GameOverPageProps) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  const passedCount = room.questDetails.filter((result) => result.passed).length;
  const failedCount = room.questDetails.filter((result) => !result.passed).length;

  const winner = useMemo(() => {
    if (room.winner === "good") {
      return "Good";
    }

    if (room.winner === "evil") {
      return "Evil";
    }

    if (passedCount >= 3) {
      return "Good";
    }

    return "Evil";
  }, [passedCount, room.winner]);

  useEffect(() => {
    setSecondsLeft(10);

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          onReturnToRoom();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [onReturnToRoom, room.id]);

  return (
    <PageContainer title="Game Over">
      <h2>{winner} Wins!</h2>

      {error ? <p>{error}</p> : null}

      <p>Successful missions: {passedCount}</p>
      <p>Failed missions: {failedCount}</p>
      <p>Returning to room in {secondsLeft}s.</p>

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

      <button onClick={onReturnToRoom} style={{ marginTop: "20px" }}>
        Return to Room
      </button>
    </PageContainer>
  );
}

export default GameOverPage;
