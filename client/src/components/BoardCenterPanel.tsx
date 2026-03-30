import { useEffect, useMemo, useRef, useState } from "react";
import "./BoardCenterPanel.css";
import type { Room, Phase } from "../types/gameTypes";
import { getRequiredTeamSize } from "../engine/gameEngine";

type QuestStatus = "future" | "current" | "success" | "fail";
type ProposalStatus = "future" | "current" | "rejected";

type DisplayableEvent = {
  id: number,
  text: string,
}

type ProposalHistoryCard = {
  id: string;
  kind: "proposal";
  questRound: number;
  proposalRound: number;
  leaderSeat: string;
  teamSeats: string;
  approvedSeats: string;
  rejectedSeats: string;
  voteResult: string;
};

type QuestHistoryCard = {
  id: string;
  kind: "quest";
  text: string;
};

type VotingHistoryCard = ProposalHistoryCard | QuestHistoryCard;

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
  const eventLogRef = useRef<HTMLDivElement | null>(null);
  const latestEventIdRef = useRef<number | null>(null);
  const [isVotingHistoryOpen, setIsVotingHistoryOpen] = useState(false);
  const leader = room.players[room.leaderIndex];
  const isLeader = leader?.id === myPlayerId;
  const lady = room.players.find((player) => player.id === room.ladyPlayerId);
  const amILady = room.ladyPlayerId === myPlayerId;
  const visibleEvents = events;
  const playerCount = room.players.length;
  const votingHistoryCards = useMemo(() => {
    let currentQuestRound = 1;
    let currentProposalRound = 0;
    const cards: VotingHistoryCard[] = [];

    const getSortedSeatLabels = (playerIds: string[]) =>
      playerIds
        .map((playerId) => room.players.find((candidate) => candidate.id === playerId))
        .filter((player): player is Room["players"][number] => Boolean(player))
        .sort((left, right) => left.seatIndex - right.seatIndex)
        .map((player) => String(player.seatIndex + 1));

    for (const event of room.eventLog) {
      if (event.type === "team_selected") {
        currentProposalRound += 1;
        cards.push({
          id: `q${currentQuestRound}-p${currentProposalRound}`,
          kind: "proposal",
          questRound: currentQuestRound,
          proposalRound: currentProposalRound,
          leaderSeat: String(event.leaderIndex + 1),
          teamSeats: getSortedSeatLabels(event.teamPlayerIds).join(", "),
          approvedSeats: "",
          rejectedSeats: "",
          voteResult: "Vote pending",
        });
        continue;
      }

      if (event.type === "vote_resolved") {
        const latestCard = cards[cards.length - 1];
        if (latestCard?.kind === "proposal") {
          latestCard.approvedSeats = getSortedSeatLabels(event.playerApproved).join(", ") || "None";
          latestCard.rejectedSeats = getSortedSeatLabels(event.playerRejected).join(", ") || "None";
          latestCard.voteResult = event.passed ? "Team Vote Passed" : "Team Vote Failed";
        }
        continue;
      }

      if (event.type === "quest_resolved") {
        const resultLine =
          event.failCardCount === 0
            ? `Quest ${event.questRound} succeeded, team members: ${
                room.questDetails
                  .find((detail) => detail.questRound === event.questRound)
                  ?.teamPlayerIds
                  .map((playerId) => room.players.find((candidate) => candidate.id === playerId))
                  .filter((player): player is Room["players"][number] => Boolean(player))
                  .sort((left, right) => left.seatIndex - right.seatIndex)
                  .map((player) => String(player.seatIndex + 1))
                  .join(", ") ?? ""
              }`
            : `Quest ${event.questRound} failed with ${event.failCardCount} fail card${
                event.failCardCount > 1 ? "s" : ""
              }, team members: ${
                room.questDetails
                  .find((detail) => detail.questRound === event.questRound)
                  ?.teamPlayerIds
                  .map((playerId) => room.players.find((candidate) => candidate.id === playerId))
                  .filter((player): player is Room["players"][number] => Boolean(player))
                  .sort((left, right) => left.seatIndex - right.seatIndex)
                  .map((player) => String(player.seatIndex + 1))
                  .join(", ") ?? ""
              }`;

        cards.push({
          id: `quest-${event.questRound}`,
          kind: "quest",
          text: resultLine,
        });

        currentQuestRound = event.questRound + 1;
        currentProposalRound = 0;
        continue;
      }

    }

    return cards;
  }, [room.eventLog, room.players]);

  useEffect(() => {
    const latestEventId =
      visibleEvents.length > 0 ? visibleEvents[visibleEvents.length - 1].id : null;

    if (latestEventId === null || latestEventId === latestEventIdRef.current) {
      return;
    }

    latestEventIdRef.current = latestEventId;

    const eventLogElement = eventLogRef.current;
    if (!eventLogElement) {
      return;
    }

    eventLogElement.scrollTo({
      top: eventLogElement.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleEvents]);

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

        <div
          className="event-log-box"
          ref={eventLogRef}
          style={{ scrollBehavior: "smooth" }}
        >
          {visibleEvents.length === 0 ? (
            <div className="event-log-placeholder"></div>
          ) : (
            visibleEvents.map((event) => (
              <div
                key={event.id}
                className="event-log-item"
                style={{
                  opacity: 0,
                  transform: "translateX(-18px)",
                  animation: "event-log-item-enter 360ms ease-out forwards",
                }}
              >
                {event.text}
              </div>
            ))
          )}
        </div>
      </div>

        {renderCenterAction()}

        {room.phase !== "initializing" ? (
          <div className="board-history-section">
            <button
              className="board-history-button"
              onClick={() => setIsVotingHistoryOpen(true)}
            >
              View Voting History
            </button>
          </div>
        ) : null}
      </div>

      {isVotingHistoryOpen ? (
        <div className="board-history-modal-overlay">
          <div className="board-history-modal">
            <div className="board-history-modal-header">
              <div className="board-history-modal-title">Voting History</div>
            </div>

            <div className="board-history-modal-body">
              {votingHistoryCards.length === 0 ? (
                <div className="board-history-empty">No voting history yet.</div>
              ) : (
                votingHistoryCards.map((card) => (
                  <div
                    key={card.id}
                    className={`board-history-card ${
                      card.kind === "quest" ? "board-history-card-quest" : ""
                    }`}
                  >
                    {card.kind === "proposal" ? (
                      <>
                        <div className="board-history-card-title">
                          Quest {card.questRound} Proposal {card.proposalRound}
                        </div>

                        <div className="board-history-card-line">
                          Leader <strong>{card.leaderSeat}</strong>
                        </div>
                        <div className="board-history-card-line">
                          Team Members <strong>{card.teamSeats}</strong>
                        </div>
                        <div className="board-history-card-line">
                          Approved <strong>{card.approvedSeats || "None"}</strong>
                        </div>
                        <div className="board-history-card-line">
                          Rejected <strong>{card.rejectedSeats || "None"}</strong>
                        </div>
                        <div className="board-history-card-line board-history-card-emphasis">
                          {card.voteResult}
                        </div>
                      </>
                    ) : (
                      <div className="board-history-card-line board-history-card-emphasis">
                        {card.text}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              className="board-history-return-button"
              onClick={() => setIsVotingHistoryOpen(false)}
            >
              Return
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
