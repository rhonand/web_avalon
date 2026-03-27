import "./BoardCenterPanel.css";
import type { Room, Phase } from "../types/gameTypes";
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
  leaderInfoRevealed: boolean;
  questStatuses: QuestStatus[];
  proposalStatuses: ProposalStatus[];
  events: DisplayableEvent[];
  requiredTeamSize: number;
  selectedTeamPlayerIds: string[];
  onStartBuildingTeam?: () => void;
  onConfirmTeam?: () => void;
  onConfirmLadyTest?: () => void;
  onConfirmAssassination?: () => void;
};

export default function BoardCenterPanel({
  room,
  myPlayerId,
  leaderInfoRevealed,
  questStatuses,
  proposalStatuses,
  events,
  requiredTeamSize,
  selectedTeamPlayerIds,
  onStartBuildingTeam,
  onConfirmTeam,
  onConfirmLadyTest,
  onConfirmAssassination,
}: BoardCenterPanelProps) {
  const leader = room.players[room.leaderIndex];
  const isLeader = leader?.id === myPlayerId;
  const lady = room.players.find((player) => player.id === room.ladyPlayerId);
  const amILady = room.ladyPlayerId === myPlayerId;
  const visibleEvents = events;
  const playerCount = room.players.length;

  function getPhaseLabel(phase: Phase) {
    switch (phase) {
      case "discussion":
        return "Team Selection";
      case "vote":
        return "Voting";
      case "mission":
        return "Mission";
      case "lady":
        return "Lady of the Lake";
      case "assassinate":
        return "Assassination";
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
      if (!leaderInfoRevealed) {
        return (
          <div className="board-action-section">
            <div className="board-waiting-text">
              Revealing leader and lake holder...
            </div>
          </div>
        );
      }

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

    if (room.phase === "lady") {
      if (room.ladyStage === "selecting") {
        if (amILady) {
          return (
            <div className="board-action-section">
              <div className="board-action-text">
                Choose one player to test with the Lady of the Lake.
              </div>

              <button
                className="board-confirm-button"
                disabled={!room.ladyTargetPlayerId}
                onClick={onConfirmLadyTest}
              >
                Confirm Target
              </button>
            </div>
          );
        }

        return (
          <div className="board-action-section">
            <div className="board-waiting-text">
              {lady?.name ?? "The Lady of the Lake"} is testing a player's loyalty...
            </div>
          </div>
        );
      }

      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            Revealing loyalty test...
          </div>
        </div>
      );
    }

    if (room.phase === "assassinate") {
      const assassin = room.players.find((player) => player.id === room.assassinPlayerId);
      const amIAssassin = room.assassinPlayerId === myPlayerId;

      if (amIAssassin) {
        return (
          <div className="board-action-section">
            <div className="board-action-text">
              Choose one player to assassinate.
            </div>

            <button
              className="board-confirm-button"
              disabled={!room.assassinationTargetPlayerId}
              onClick={onConfirmAssassination}
            >
              Confirm Assassination
            </button>
          </div>
        );
      }

      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            {assassin?.name ?? "The Assassin"} is choosing a target...
          </div>
        </div>
      );
    }

    if (room.phase === "questResult") {
      return (
        <div className="board-action-section">
          <div className="board-waiting-text">
            Displaying quest results...
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
