import "./BoardCenterPanel.css";
import type { Room, Player, QuestResult, Phase, GameEvent } from "../types/gameTypes";
import { getRequiredTeamSize } from "../engine/gameEngine";

type QuestStatus = "future" | "current" | "success" | "fail";
type ProposalStatus = "future" | "current" | "rejected";

type DisplayableEvent = {
  id: number,
  text: string,
}

type BoardCenterPanelProps = {
  room: Room;
  myPlayerId: string;
  questStatuses: QuestStatus[];
  proposalStatuses: ProposalStatus[];
  events: DisplayableEvent[];
  requiredTeamSize: number;
  selectedTeamPlayerIds: string[];
  onStartBuildingTeam?: () => void;
  onConfirmTeam?: () => void;
};

export default function BoardCenterPanel({
  room,
  myPlayerId,
  questStatuses,
  proposalStatuses,
  events,
  requiredTeamSize,
  selectedTeamPlayerIds,
  onStartBuildingTeam,
  onConfirmTeam,
}: BoardCenterPanelProps) {
  const leader = room.players[room.leaderIndex];
  const me = room.players.find((player) => player.id === myPlayerId);
  const isLeader = leader?.id === myPlayerId;
  const visibleEvents = events
  const playerCount = room.players.length;

  const selectedTeamPlayers = selectedTeamPlayerIds
    .map((id) => room.players.find((player) => player.id === id))
    .filter(Boolean) as Player[];

  const questTrack: QuestResult[] = room.questDetails.map((result) =>
    result.passed ? "success" : "fail"
  );

  function getPhaseLabel(phase: Phase) {
    switch (phase) {
      case "discussion":
        return "Team Selection";
      case "vote":
        return "Voting";
      case "mission":
        return "Mission";
      case "questResult":
        return "Quest Result";
      case "gameOver":
        return "Game Over";
      default:
        return phase;
    }
  }



  function renderCenterAction() {
    if (room.phase === "initializing") {
      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            Game initializing...
          </div>
        </div>
      );
    }

    if (room.phase === "discussion") {
      if (isLeader) {
        if (room.proposalStage === "discussion") {
          return (
            <div className="board-action-section">
              <div className="board-action-text">
                You are the leader, click the buttion to start building your team.
              </div>

              <button
                className="board-start-building-team-button"
                onClick={onStartBuildingTeam}
              >
                Start Building Team
              </button>
            </div>
          );
        } else {
          return (
            <div className="board-action-section">
              <div className="board-action-text">
                Select {requiredTeamSize} players for this mission.
              </div>

              <button
                className="board-confirm-button"
                disabled={selectedTeamPlayerIds.length !== requiredTeamSize}
                onClick={onConfirmTeam}
              >
                Confirm Team
              </button>
            </div>
          );
        }
      }

      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            {leader?.name} is building a team...
          </div>
        </div>
      );
    }

    if (room.phase === "vote") {
      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            Voting in progress...
          </div>
        </div>
      );
    }

    if (room.phase === "mission") {
      const amOnTeam = selectedTeamPlayerIds.includes(myPlayerId);

      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            {amOnTeam
              ? "Mission in progress. Check your mission panel."
              : "Mission in progress..."}
          </div>
        </div>
      );
    }

    if (room.phase === "questResult") {
      const latestResult = room.questDetails[room.questDetails.length - 1];

      return (
        <div className="board-action-section">
          <div className="board-result-text">
            {latestResult?.passed ? "Quest succeeded" : "Quest failed"}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="board-center-panel">
      <div className="board-card">
        <div className="board-header">
          <h2 className="board-title">Avalon</h2>
          <div className="board-phase-badge">{getPhaseLabel(room.phase)}</div>
        </div>

        <div className="track-section">
          <div className="track-label">Quest Track</div>
            <div className="track-row">
              {questStatuses.map((status, index) => (
              <div
                key={`quest-${index}`}
                className={`track-circle quest-circle ${status}`}
              > 
                {(status === "current" || status === "future") && getRequiredTeamSize(playerCount, index)}
              </div>
            ))}
          </div>
        </div>

        <div className="track-section">
          <div className="track-label">Proposal Track</div>
          <div className="track-row proposal-row">
            {proposalStatuses.map((status, index) => (
              <div
                key={`proposal-${index}`}
                className={`track-circle proposal-circle ${status}`}
              >
                
              </div>
            ))}
          </div>
        </div>

      <div className="event-log-section">
        <div className="section-title">Event Log</div>

        <div className="event-log-box">
          {visibleEvents.length === 0 ? (
            <div className="event-log-placeholder"></div>
          ) : (
            visibleEvents.map((event) => (
              <div key={event.id} className="event-log-item">
                {event.text}
              </div>
            ))
          )}
        </div>
      </div>

        {renderCenterAction()}
      </div>
    </div>
  );
}