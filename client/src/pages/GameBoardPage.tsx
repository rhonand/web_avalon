import { useState, useEffect, useRef } from "react";
import "./GameBoardPage.css";
import SeatColumn from "../components/SeatColumn";
import BoardCenterPanel from "../components/BoardCenterPanel";
import VoteModal from "../components/VoteModal";
import MissionModal from "../components/QuestModal";
import QuestResultModal from "../components/QuestResultModal";
import PlayerInfoModal from "../components/PlayerInfoModal";
import { getVisiblePlayerInfo,getSeatMetaInfoForViewer } from "../engine/visibilityEngine";
import type { Player, Room, GameEvent } from "../types/gameTypes";


type GameBoardPageProps = {
  room: Room;
  myPlayerId: string;
  requiredTeamSize: number;
  onSeatClick: (playerId: string) => void;
  onStartBuildingTeam: () => void;
  onConfirmTeam: () => void;
  onSubmitVote: (vote: "approve" | "reject") => void;
  onSubmitMissionAction: (action: "success" | "fail") => void;
  onDismissQuestResult: () => void;
};



export default function GameBoardPage({
  room,
  myPlayerId,
  requiredTeamSize,
  onSeatClick,
  onStartBuildingTeam,
  onConfirmTeam,
  onSubmitVote,
  onSubmitMissionAction,
  onDismissQuestResult,
}: GameBoardPageProps) {
  const leader = room.players[room.leaderIndex];
  const leaderPlayerId = leader?.id;
  const myVote = room.votes[myPlayerId];
  const myMissionAction = room.questActions[myPlayerId];

 // const questStatuses = ["current", "future", "future", "future", "future"] as const;
//  const proposalStatuses = ["current", "future", "future", "future", "future"] as const;

  const [privateInfoRevealed, setPrivateInfoRevealed] = useState(false);
  const [leaderBadgeRevealed, setLeaderBadgeRevealed] = useState(false);
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

  const selectedTeamPlayerIds = room.selectedTeamPlayerIds;
  const teamPlayerNames = selectedTeamPlayerIds
    .map((id) => room.players.find((player) => player.id === id)?.name)
    .filter(Boolean) as string[];


  const amOnTeam = selectedTeamPlayerIds.includes(myPlayerId);

  const me = room.players.find((player) => player.id === myPlayerId);
  const canFail = me?.team === "evil";

  const latestQuestResult =
    room.questDetails.length > 0
      ? room.questDetails[room.questDetails.length - 1]
      : undefined;

  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  const inspectedPlayer = room.players.find(
    (player) => player.id === inspectedPlayerId
  );

  const viewer = room.players.find((player) => player.id === myPlayerId);

  const visibleInfo =
    viewer && inspectedPlayer
      ? getVisiblePlayerInfo(viewer, inspectedPlayer, room)
      : null;

  const displayEvents = room.eventLog.map((event) => ({
    id: event.id,
    text: formatEvent(event, room),
  }));

  const allDisplayEvents = [...localEvents, ...displayEvents];

  const prevPhaseRef = useRef(room.phase);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;

    if (room.phase === "initializing") {
      setPrivateInfoRevealed(false);
      setLeaderBadgeRevealed(false);
      setLocalEvents([]);
    }

    if (prevPhase === "initializing" && room.phase === "discussion") {
      const timer = setTimeout(() => {
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
     }, 100);

      const leaderTimer = setTimeout(() => {
        setLeaderBadgeRevealed(true);
      }, 800);

      prevPhaseRef.current = room.phase;

      return () => {
        clearTimeout(timer);
        clearTimeout(leaderTimer);
      };
    }

    prevPhaseRef.current = room.phase;
  }, [room.phase, room.players, myPlayerId]);

  function getSeatMetaInfo(playerId: string) {
    if (!viewer) return null;

    const target = room.players.find((player) => player.id === playerId);
    if (!target) return null;

    //if (room.phase === "initializing") return null;

    return getSeatMetaInfoForViewer(viewer, target);
  }

  function handleSeatInteraction(playerId: string) {
    const leader = room.players[room.leaderIndex];
    const amILeader = leader?.id === myPlayerId;

    const isLeaderBuildingTeam =
      room.phase === "discussion" &&
      room.proposalStage === "teamBuilding" &&
      amILeader;

 

    if (isLeaderBuildingTeam) {
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

      case "team_selected": {
        const teamSeats = event.teamPlayerIds
          .map((playerId) => {
            const index = room.players.findIndex((p) => p.id === playerId);
            return index >= 0 ? index + 1 : "?";
          })
          .join(", ");

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

      default:
        return "Unknown event.";
    }
  }

  



  function addPlayerToNextAvailableSeat(room: Room, player: Omit<Player, "seatIndex">): Room {
      const occupied = new Set(room.players.map((p) => p.seatIndex));
      const nextSeat = Array.from({ length: 10 }, (_, i) => i).find((i) => !occupied.has(i));
  
      if (nextSeat === undefined) return room;
  
      return {
        ...room,
        players: [
          ...room.players,
          {
            ...player,
            seatIndex: nextSeat,
          },
        ],
      };
    }

  function handleAddBot(room: Room): Room {
    const botNumber = room.players.filter((p) => p.type === "bot").length + 1;

    return addPlayerToNextAvailableSeat(room, {
      id: `bot-${botNumber}`,
      name: `Bot ${botNumber}`,
      type: "bot",
      isHost: false,
    });
  }

  function handleAddNineBots(room: Room): Room {
    let nextRoom = room;
    const remaining = 10 - room.players.length;

    for (let i = 0; i < remaining; i++) {
      nextRoom = handleAddBot(nextRoom);
    }

    return nextRoom;
  }


  return (
    <div className="game-board-page">
      <div className="game-board-layout">
        <SeatColumn
          seatIndices={[0, 1, 2, 3, 4]}
          room={room}
          selectedTeamPlayerIds={selectedTeamPlayerIds}
          leaderPlayerId={leaderPlayerId}
          onSeatClick={handleSeatInteraction}
          privateInfoRevealed={privateInfoRevealed}
          leaderBadgeRevealed={leaderBadgeRevealed}
          seatMetaResolver={getSeatMetaInfo}
        />

        <BoardCenterPanel
          room={room}
          myPlayerId={myPlayerId}
          requiredTeamSize={requiredTeamSize}
          questStatuses={[...questStatuses]}
          proposalStatuses={[...proposalStatuses]}
          events={allDisplayEvents}
          selectedTeamPlayerIds={selectedTeamPlayerIds}
          onStartBuildingTeam={onStartBuildingTeam}
          onConfirmTeam={onConfirmTeam}
        />

        <SeatColumn
          seatIndices={[5, 6, 7, 8, 9]}
          room={room}
          selectedTeamPlayerIds={selectedTeamPlayerIds}
          leaderPlayerId={leaderPlayerId}
          onSeatClick={handleSeatInteraction}
          privateInfoRevealed={privateInfoRevealed}
          leaderBadgeRevealed={leaderBadgeRevealed}
          seatMetaResolver={getSeatMetaInfo}
        />
      </div>

      <VoteModal
        isOpen={room.phase === "vote"}
        teamPlayerNames={teamPlayerNames}
        myVote={myVote}
        onApprove={() => onSubmitVote("approve")}
        onReject={() => onSubmitVote("reject")}
      />

      <MissionModal
        isOpen={room.phase === "mission"}
        amOnTeam={amOnTeam}
        myMissionAction={myMissionAction}
        canFail={!!canFail}
        teamPlayerNames={teamPlayerNames}
        onSuccess={() => onSubmitMissionAction("success")}
        onFail={() => onSubmitMissionAction("fail")}
      />

      <QuestResultModal
        isOpen={room.phase === "questResult" && !!latestQuestResult}
        questNumber={latestQuestResult?.questRound ?? room.questRound}
        passed={latestQuestResult?.passed ?? false}
        successCount={latestQuestResult?.successCount ?? 0}
        failCount={latestQuestResult?.failCount ?? 0}
        onClose={onDismissQuestResult}
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