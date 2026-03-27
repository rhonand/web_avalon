import { useEffect, useRef, type Dispatch } from "react";
import type { Room, VoteChoice, QuestAction, GameEvent } from "../types/gameTypes";
import {
  getRequiredTeamSize,
  resolveVote,
  resolveQuest,
  advanceAfterQuestResult,
} from "../engine/gameEngine";

type SetRoom = Dispatch<React.SetStateAction<Room>>;

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function autoPickTeamForBotLeader(room: Room, myPlayerId: string): string[] {
  const requiredTeamSize = getRequiredTeamSize(
    room.players.length,
    room.questRound
  );

  const me = room.players.find((player) => player.id === myPlayerId);
  const others = room.players.filter((player) => player.id !== myPlayerId);

  const shuffledOthers = shuffle(others);

  const team: string[] = [];

  if (me) {
    team.push(me.id);
  }

  for (const player of shuffledOthers) {
    if (team.length >= requiredTeamSize) break;
    team.push(player.id);
  }

  return team;
}

export function useGameAutomation(
  room: Room,
  setRoom: SetRoom,
  myPlayerId: string
) {

  useEffect(() => {
    if (room.phase !== "initializing") return;
  
    const timer = setTimeout(() => {
      setRoom(prev => {
        if (prev.phase !== "initializing") return prev;

        return {
          ...prev,
          phase: "discussion",
        };
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, [room.phase, setRoom]);


  const prevPhaseRef = useRef(room.phase);
    useEffect(() => {
      const prevPhase = prevPhaseRef.current;
  
      if (prevPhase === "initializing" && room.phase === "discussion") {
        const timer = setTimeout(() => {
          setRoom(prev => {
            if (prev.phase !== "discussion") return prev;

            const event : GameEvent = {
              id: room.eventCounter,
              type: "leader_assigned",
              leaderIndex: room.leaderIndex,
            }

            return {
              ...prev,
              eventCounter: prev.eventCounter + 1,
              eventLog: [...prev.eventLog,event],
            };
          });

        }, 800);


        return () => clearTimeout(timer);
      }
      prevPhaseRef.current = room.phase;
    }, [room.phase, setRoom]);

  // 1) Bot leader auto-picks team
  useEffect(() => {
    if (room.phase !== "discussion") return;
    if (room.proposalStage !== "discussion") return;

    const leader = room.players[room.leaderIndex];
    if (leader.type !== "bot") return;

    const timer = setTimeout(() => {
      setRoom(prev => ({
        ...prev,
        proposalStage: "teamBuilding",
        selectedTeamPlayerIds: [],
      }));
    }, 800);

    return () => clearTimeout(timer);
  }, [room.phase, room.proposalStage, room.leaderIndex]);

  useEffect(() => {
    if (room.phase !== "discussion") return;
    if (room.proposalStage !== "teamBuilding") return;

    const leader = room.players[room.leaderIndex];
    if (leader.type !== "bot") return;

    

    const timer = setTimeout(() => {
      setRoom(prev => {
        const teamPlayerIds = autoPickTeamForBotLeader(prev, myPlayerId);

        const event: GameEvent = {
          id: prev.eventCounter,
          type: "team_selected",
          leaderIndex: prev.leaderIndex,
          teamPlayerIds: [...teamPlayerIds],
        };

        return {
          ...prev,
          selectedTeamPlayerIds: teamPlayerIds,
          phase: "vote",
          proposalStage: "discussion",
          votes: {},
          eventCounter: prev.eventCounter + 1,
          eventLog: [...prev.eventLog, event],
        };
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [room.phase, room.proposalStage, room.leaderIndex]);

 
  // 2) Bots auto-vote approve
  useEffect(() => {
    if (!room) return;
    if (room.phase !== "vote") return;

    const pendingBots = room.players.filter(
      (player) => player.type === "bot" && !room.votes[player.id]
    );

    if (pendingBots.length === 0) return;

    const timer = setTimeout(() => {
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.phase !== "vote") return prev;

        const nextVotes: Record<string, VoteChoice> = { ...prev.votes };

        for (const bot of prev.players) {
          if (bot.type === "bot" && !nextVotes[bot.id]) {
            nextVotes[bot.id] = "approve";
          }
        }

        return {
          ...prev,
          votes: nextVotes,
        };
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [room?.phase, room?.votes, room?.players, setRoom]);

  // 3) Auto-resolve vote once everyone has voted
  useEffect(() => {
    if (!room) return;
    if (room.phase !== "vote") return;

    const allVoted = room.players.every((player) => !!room.votes[player.id]);
    if (!allVoted) return;

    const timer = setTimeout(() => {
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.phase !== "vote") return prev;
        return resolveVote(prev);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [room?.phase, room?.votes, room?.players, setRoom]);

  // 4) Bots auto-submit mission success
  useEffect(() => {
    if (!room) return;
    if (room.phase !== "mission") return;

    const teamPlayers = room.players.filter((player) =>
      room.selectedTeamPlayerIds.includes(player.id)
    );

    const pendingBots = teamPlayers.filter(
      (player) => player.type === "bot" && !room.questActions[player.id]
    );

    if (pendingBots.length === 0) return;

    const timer = setTimeout(() => {
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.phase !== "mission") return prev;

        const nextQuestActions: Record<string, QuestAction> = {
          ...prev.questActions,
        };

        for (const player of prev.players) {
          if (
            player.type === "bot" &&
            prev.selectedTeamPlayerIds.includes(player.id) &&
            !nextQuestActions[player.id]
          ) {
            nextQuestActions[player.id] = "success";
          }
        }

        return {
          ...prev,
          questActions: nextQuestActions,
        };
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [room?.phase, room?.questActions, room?.players, room?.selectedTeamPlayerIds, setRoom]);

  // 5) Auto-resolve mission when all team members have submitted
  useEffect(() => {
    if (!room) return;
    if (room.phase !== "mission") return;

    const allSubmitted = room.selectedTeamPlayerIds.every(
      (playerId) => !!room.questActions[playerId]
    );

    if (!allSubmitted) return;

    const timer = setTimeout(() => {
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.phase !== "mission") return prev;
        return resolveQuest(prev);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [room?.phase, room?.questActions, room?.selectedTeamPlayerIds, setRoom]);

  // 6) Auto-advance after quest result
  useEffect(() => {
    if (!room) return;
    if (room.phase !== "questResult") return;

    const timer = setTimeout(() => {
      setRoom((prev) => {
        if (!prev) return prev;
        if (prev.phase !== "questResult") return prev;
        return advanceAfterQuestResult(prev);
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [room?.phase, setRoom]);
}
