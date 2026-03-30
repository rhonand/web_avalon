import { useState, useEffect, useRef } from "react";
import "./GameBoardPage.css";
import SeatColumn from "../components/SeatColumn";
import BoardCenterPanel from "../components/BoardCenterPanel";
import VoteModal from "../components/VoteModal";
import MissionModal from "../components/QuestModal";
import QuestResultModal from "../components/QuestResultModal";
import LadyResultModal from "../components/LadyResultModal";
import PlayerInfoModal from "../components/PlayerInfoModal";
import { getVisiblePlayerInfo,getSeatMetaInfoForViewer } from "../engine/visibilityEngine";
import type { Room, GameEvent } from "../types/gameTypes";


type GameBoardPageProps = {
  room: Room;
  myPlayerId: string;
  error?: string;
  requiredTeamSize: number;
  onSeatClick: (playerId: string) => void;
  onStartBuildingTeam: () => void;
  onConfirmTeam: () => void;
  onConfirmLadyTest: () => void;
  onConfirmAssassination: () => void;
  onSubmitVote: (vote: "approve" | "reject") => void;
  onSubmitMissionAction: (action: "success" | "fail") => void;
  onDismissQuestResult: () => void;
};



export default function GameBoardPage({
  room,
  myPlayerId,
  error,
  requiredTeamSize,
  onSeatClick,
  onStartBuildingTeam,
  onConfirmTeam,
  onConfirmLadyTest,
  onConfirmAssassination,
  onSubmitVote,
  onSubmitMissionAction,
  onDismissQuestResult,
}: GameBoardPageProps) {
  function getChipVisualKind(player: Room["players"][number]) {
    if (player.id === myPlayerId) {
      return "self" as const;
    }

    if (!viewer) {
      return "default" as const;
    }

    const seatMeta = getSeatMetaInfoForViewer(viewer, player, room);
    if (!seatMeta) {
      return "default" as const;
    }

    if (seatMeta.text === "Merlin?") {
      return "merlin-maybe" as const;
    }

    if (seatMeta.tone === "evil") {
      return "evil" as const;
    }

    if (seatMeta.tone === "good") {
      return "good" as const;
    }

    return "default" as const;
  }

  function getSortedSeatLabels(playerIds: string[]): string[] {
    return playerIds
      .map((playerId) => room.players.find((player) => player.id === playerId))
      .filter((player): player is Room["players"][number] => Boolean(player))
      .sort((left, right) => left.seatIndex - right.seatIndex)
      .map((player) => String(player.seatIndex + 1));
  }

  const privateInfoTimerRef = useRef<number | null>(null);
  const leaderRevealTimerRef = useRef<number | null>(null);
  const ladyRevealTimerRef = useRef<number | null>(null);
  const leader = room.players[room.leaderIndex];
  const leaderPlayerId = leader?.id;
  const myVote = room.votes[myPlayerId];
  const myMissionAction = room.questActions[myPlayerId];

 // const questStatuses = ["current", "future", "future", "future", "future"] as const;
//  const proposalStatuses = ["current", "future", "future", "future", "future"] as const;

  const [privateInfoRevealed, setPrivateInfoRevealed] = useState(false);
  const [leaderBadgeRevealed, setLeaderBadgeRevealed] = useState(false);
  const [ladyBadgeRevealed, setLadyBadgeRevealed] = useState(false);
  const [localEvents, setLocalEvents] = useState<{ id: number; text: string }[]>([]);

  const currentQuestIndex = room.questRound - 1;
  const currentProposalIndex = room.proposalRound - 1;

  const questStatuses = Array.from({ length: 5 }, (_, i) => {
    const questPassed = room.questDetails?.[i]?.passed;

    if (questPassed === true) return "success";
    if (questPassed === false) return "fail";
    if (i === currentQuestIndex) return "current";
    return "future";
  });

  const proposalStatuses = Array.from({ length: 5 }, (_, i) => {
    if (i < currentProposalIndex) return "rejected";
    if (i === currentProposalIndex) return "current";
    return "future";
  });


  /*
    const events = [
    { id: "1", text: "You are the leader." },
    { id: "2", text: "No players selected yet." },
  ];
  */

  const viewer = room.players.find((player) => player.id === myPlayerId);

  const selectedTeamPlayerIds = room.selectedTeamPlayerIds;
  const teamPlayers = selectedTeamPlayerIds
    .map((playerId) => room.players.find((player) => player.id === playerId))
    .filter((player): player is Room["players"][number] => Boolean(player))
    .sort((left, right) => left.seatIndex - right.seatIndex)
    .map((player) => ({
      label: String(player.seatIndex + 1),
      visualKind: getChipVisualKind(player),
    }));


  const amOnTeam = selectedTeamPlayerIds.includes(myPlayerId);

  const me = room.players.find((player) => player.id === myPlayerId);
  const canFail = me?.team === "evil";

  const latestQuestResult =
    room.questDetails.length > 0
      ? room.questDetails[room.questDetails.length - 1]
      : undefined;
  const [dismissedQuestResultRound, setDismissedQuestResultRound] = useState<number | null>(null);
  const [dismissedLadyResultId, setDismissedLadyResultId] = useState<number | null>(null);

  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  const inspectedPlayer = room.players.find(
    (player) => player.id === inspectedPlayerId
  );

  const visibleInfo =
    viewer && inspectedPlayer
      ? getVisiblePlayerInfo(viewer, inspectedPlayer, room)
      : null;
  const ladyBlockedPlayerIds =
    room.phase === "lady" &&
    room.ladyStage === "selecting" &&
    room.ladyPlayerId === myPlayerId
      ? room.formerLadyPlayerIds.filter((playerId) => playerId !== myPlayerId)
      : [];

  const displayEvents = room.eventLog
    .filter((event) => {
      if (event.type === "leader_assigned") {
        return leaderBadgeRevealed;
      }

      if (
        event.type === "lady_assigned_public" ||
        event.type === "lady_assigned_private_self"
      ) {
        return ladyBadgeRevealed;
      }

      return true;
    })
    .map((event) => ({
      id: event.id,
      text: formatEvent(event, room),
    }));

  const allDisplayEvents = [...localEvents, ...displayEvents];

  const prevPhaseRef = useRef(room.phase);

  useEffect(() => {
    return () => {
      if (privateInfoTimerRef.current !== null) {
        window.clearTimeout(privateInfoTimerRef.current);
      }
      if (leaderRevealTimerRef.current !== null) {
        window.clearTimeout(leaderRevealTimerRef.current);
      }
      if (ladyRevealTimerRef.current !== null) {
        window.clearTimeout(ladyRevealTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;

    if (room.phase === "initializing") {
      if (privateInfoTimerRef.current !== null) {
        window.clearTimeout(privateInfoTimerRef.current);
        privateInfoTimerRef.current = null;
      }
      if (leaderRevealTimerRef.current !== null) {
        window.clearTimeout(leaderRevealTimerRef.current);
        leaderRevealTimerRef.current = null;
      }
      if (ladyRevealTimerRef.current !== null) {
        window.clearTimeout(ladyRevealTimerRef.current);
        ladyRevealTimerRef.current = null;
      }

      setPrivateInfoRevealed(false);
      setLeaderBadgeRevealed(false);
      setLadyBadgeRevealed(false);
      setLocalEvents([]);
    }

    const enteredDiscussionFromInitializing =
      prevPhase === "initializing" && room.phase === "discussion";
    const needsRevealTimers =
      room.phase === "discussion" &&
      (!privateInfoRevealed || !leaderBadgeRevealed || !ladyBadgeRevealed);

    if (
      (enteredDiscussionFromInitializing || needsRevealTimers) &&
      privateInfoTimerRef.current === null &&
      leaderRevealTimerRef.current === null &&
      ladyRevealTimerRef.current === null
    ) {
      privateInfoTimerRef.current = window.setTimeout(() => {
        setPrivateInfoRevealed(true);

        const me = room.players.find((player) => player.id === myPlayerId);
        if (me) {
          setLocalEvents([
            {
              id: 0,
              text: `You are ${me.role} for this game.`,
            },
          ]);
        }
        privateInfoTimerRef.current = null;
      }, 100);

      leaderRevealTimerRef.current = window.setTimeout(() => {
        setLeaderBadgeRevealed(true);
        leaderRevealTimerRef.current = null;
      }, 2000);

      ladyRevealTimerRef.current = window.setTimeout(() => {
        setLadyBadgeRevealed(true);
        ladyRevealTimerRef.current = null;
      }, 2000);
    }

    prevPhaseRef.current = room.phase;
  }, [
    room.phase,
    room.players,
    myPlayerId,
    privateInfoRevealed,
    leaderBadgeRevealed,
    ladyBadgeRevealed,
  ]);

  useEffect(() => {
    if (room.phase !== "questResult") {
      setDismissedQuestResultRound(null);
    }
  }, [room.phase]);

  useEffect(() => {
    if (room.phase !== "lady" || room.ladyStage !== "result") {
      setDismissedLadyResultId(null);
    }
  }, [room.phase, room.ladyStage]);

  function getSeatMetaInfo(playerId: string) {
    if (!viewer) return null;

    const target = room.players.find((player) => player.id === playerId);
    if (!target) return null;

    //if (room.phase === "initializing") return null;

    return getSeatMetaInfoForViewer(viewer, target, room);
  }

  function handleSeatInteraction(playerId: string) {
    const leader = room.players[room.leaderIndex];
    const amILeader = leader?.id === myPlayerId;

    const isLeaderBuildingTeam =
      room.phase === "discussion" &&
      room.proposalStage === "teamBuilding" &&
      amILeader;

    const amILady =
      room.phase === "lady" &&
      room.ladyStage === "selecting" &&
      room.ladyPlayerId === myPlayerId;

    const amIAssassin =
      room.phase === "assassinate" &&
      room.assassinPlayerId === myPlayerId;

 

    if (isLeaderBuildingTeam || amILady || amIAssassin) {
      console.log("toggle team member");
      onSeatClick(playerId);
      return;
    }

    console.log("open player info");
  

    setInspectedPlayerId(playerId);
  }

  function formatEvent(event: GameEvent, room: Room): string {
    switch (event.type) {
      case "leader_assigned": {
        return `Player ${event.leaderIndex + 1} is now the leader.`;
      }

      case "lady_tested_public": {
        const actor = room.players.find((candidate) => candidate.id === event.actorPlayerId);
        const target = room.players.find((candidate) => candidate.id === event.targetPlayerId);
        const actorSeat = actor ? actor.seatIndex + 1 : "?";
        const targetSeat = target ? target.seatIndex + 1 : "?";
        return `Player ${actorSeat} tested the loyalty of Player ${targetSeat}.`;
      }

      case "lady_tested_private_lady": {
        const target = room.players.find((candidate) => candidate.id === event.targetPlayerId);
        const targetSeat = target ? target.seatIndex + 1 : "?";
        return `You tested the loyalty of Player ${targetSeat}, they are on the ${event.revealedTeam} side.`;
      }

      case "lady_tested_private_target": {
        const actor = room.players.find((candidate) => candidate.id === event.actorPlayerId);
        const actorSeat = actor ? actor.seatIndex + 1 : "?";
        return `Player ${actorSeat} tested your loyalty, they know you are on the ${event.revealedTeam} side.`;
      }

      case "lady_assigned_public": {
        const player = room.players.find((candidate) => candidate.id === event.playerId);
        const seatLabel = player ? player.seatIndex + 1 : "?";
        return `Player ${seatLabel} is now Lady of the Lake.`;
      }

      case "lady_assigned_private_self": {
        return "You are now the Lady of the Lake.";
      }

      case "team_selected": {
        const teamSeats = getSortedSeatLabels(event.teamPlayerIds).join(", ");

        return `Player ${event.leaderIndex + 1} selected Players ${teamSeats} to form the team.`;
      }

      case "vote_resolved": {
        return event.passed ? "Team vote passed." : "Team vote failed.";
      }

      case "quest_resolved": {
        if (event.failCardCount === 0) {
          return `Quest ${event.questRound} succeeded.`;
        }
        return `Quest ${event.questRound} failed with ${event.failCardCount} fail card${event.failCardCount > 1 ? "s" : ""}.`;
      }

      case "assassination_initiated": {
        return "Assassination phase has begun.";
      }

      case "assassination_resolved": {
        const assassin = room.players.find((candidate) => candidate.id === event.assassinPlayerId);
        const target = room.players.find((candidate) => candidate.id === event.targetPlayerId);
        const assassinSeat = assassin ? assassin.seatIndex + 1 : "?";
        const targetSeat = target ? target.seatIndex + 1 : "?";
        return event.success
          ? `Player ${assassinSeat} assassinated Player ${targetSeat}. Evil wins.`
          : `Player ${assassinSeat} failed to assassinate Merlin by choosing Player ${targetSeat}. Good wins.`;
      }

      default:
        return "Unknown event.";
    }
  }

  const highlightedPlayerIds =
    room.phase === "lady" && room.ladyStage === "selecting" && room.ladyTargetPlayerId
      ? [room.ladyTargetPlayerId]
      : room.phase === "assassinate" && room.assassinationTargetPlayerId
        ? [room.assassinationTargetPlayerId]
      : selectedTeamPlayerIds;

  
  return (
    <div className="game-board-page">
      {error ? <p style={{ margin: "12px 24px 0" }}>{error}</p> : null}
      <div className="game-board-layout">
        <SeatColumn
          seatIndices={[0, 1, 2, 3, 4]}
          room={room}
          myPlayerId={myPlayerId}
          ladyPlayerId={ladyBadgeRevealed ? room.ladyPlayerId : null}
          selectedTeamPlayerIds={highlightedPlayerIds}
          disabledPlayerIds={ladyBlockedPlayerIds}
          disabledReasonResolver={() =>
            "This player was Lady of the Lake and cannot be tested."
          }
          leaderPlayerId={leaderPlayerId}
          onSeatClick={handleSeatInteraction}
          privateInfoRevealed={privateInfoRevealed}
          leaderBadgeRevealed={leaderBadgeRevealed}
          seatMetaResolver={getSeatMetaInfo}
        />

        <BoardCenterPanel
          room={room}
          myPlayerId={myPlayerId}
          leaderInfoRevealed={leaderBadgeRevealed}
          requiredTeamSize={requiredTeamSize}
          questStatuses={[...questStatuses]}
          proposalStatuses={[...proposalStatuses]}
          events={allDisplayEvents}
          selectedTeamPlayerIds={selectedTeamPlayerIds}
          onStartBuildingTeam={onStartBuildingTeam}
          onConfirmTeam={onConfirmTeam}
          onConfirmLadyTest={onConfirmLadyTest}
          onConfirmAssassination={onConfirmAssassination}
        />

        <SeatColumn
          seatIndices={[5, 6, 7, 8, 9]}
          room={room}
          myPlayerId={myPlayerId}
          ladyPlayerId={ladyBadgeRevealed ? room.ladyPlayerId : null}
          selectedTeamPlayerIds={highlightedPlayerIds}
          disabledPlayerIds={ladyBlockedPlayerIds}
          disabledReasonResolver={() =>
            "This player was Lady of the Lake and cannot be tested."
          }
          leaderPlayerId={leaderPlayerId}
          onSeatClick={handleSeatInteraction}
          privateInfoRevealed={privateInfoRevealed}
          leaderBadgeRevealed={leaderBadgeRevealed}
          seatMetaResolver={getSeatMetaInfo}
        />
      </div>

      <VoteModal
        isOpen={room.phase === "vote" && myVote === undefined}
        teamPlayers={teamPlayers}
        myVote={myVote}
        onApprove={() => onSubmitVote("approve")}
        onReject={() => onSubmitVote("reject")}
      />

      <MissionModal
        isOpen={room.phase === "mission" && amOnTeam && myMissionAction === undefined}
        amOnTeam={amOnTeam}
        myMissionAction={myMissionAction}
        canFail={!!canFail}
        teamPlayers={teamPlayers}
        onSuccess={() => onSubmitMissionAction("success")}
        onFail={() => onSubmitMissionAction("fail")}
      />

      <QuestResultModal
        isOpen={
          room.phase === "questResult" &&
          !!latestQuestResult &&
          dismissedQuestResultRound !== latestQuestResult.questRound
        }
        questNumber={latestQuestResult?.questRound ?? room.questRound}
        passed={latestQuestResult?.passed ?? false}
        successCount={latestQuestResult?.successCount ?? 0}
        failCount={latestQuestResult?.failCount ?? 0}
        onClose={() => {
          if (latestQuestResult) {
            setDismissedQuestResultRound(latestQuestResult.questRound);
          }
          onDismissQuestResult();
        }}
      />

      <LadyResultModal
        isOpen={
          room.phase === "lady" &&
          room.ladyStage === "result" &&
          room.ladyPlayerId === myPlayerId &&
          !!room.ladyResult &&
          dismissedLadyResultId !== room.ladyResult.id
        }
        resultText={room.ladyResult?.text ?? ""}
        onClose={() => {
          if (room.ladyResult) {
            setDismissedLadyResultId(room.ladyResult.id);
          }
        }}
      />

      <PlayerInfoModal
        isOpen={!!inspectedPlayer}
        player={inspectedPlayer}
        visibleInfo={visibleInfo}
        onClose={() => setInspectedPlayerId(null)}
/>
    </div>
  );
}
