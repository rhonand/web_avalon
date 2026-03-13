import type { Room, Player, VoteChoice, QuestDetail, QuestAction, GameEvent } from "../types/gameTypes";
import { assembleRoleDeck, dealCardsToPlayers } from "./roleEngine";

export function leaveRoom(room: Room, playerId: string): Room {
  const leavingPlayer = room.players.find((p) => p.id === playerId);
  if (!leavingPlayer) return room;

  const remainingPlayers = room.players
    .filter((p) => p.id !== playerId)
    .map((p) => ({ ...p, isHost: false }));

  if (remainingPlayers.length === 0) {
    return {
      ...room,
      players: [],
    };
  }

  const nextHost = [...remainingPlayers].sort(
    (a, b) => a.seatIndex - b.seatIndex
  )[0];

  const updatedPlayers = remainingPlayers.map((p) =>
    p.id === nextHost.id ? { ...p, isHost: true } : p
  );

  return {
    ...room,
    players: updatedPlayers,
  };
}

export function startGame(room: Room): Room {
  const deck = assembleRoleDeck(room.players.length);
  const playersWithCards = dealCardsToPlayers(room.players, deck);

  return {
    ...room,
    players: playersWithCards,
    phase: "initializing",
    proposalStage: "discussion",
    questRound: 1,
    proposalRound: 1,
    leaderIndex: 0,
    selectedTeamPlayerIds: [],
    votes: {},
    questActions: {},
    questDetails: [],
    eventCounter: 0,
    eventLog: [] as GameEvent[],
  };
}

export function getRequiredTeamSize(playerCount: number, questRound: number): number {
  const sizes = [3, 4, 4, 5, 5];
  switch(playerCount) {
    case 5:
      const sizes = [2, 3, 3, 2, 3];
  }
  return sizes[questRound - 1]??3;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function togglePlayerSelection(room: Room, playerId: string): Room {
  if (room.phase !== "discussion") return room;

  const requiredTeamSize = getRequiredTeamSize(room.players.length, room.questRound);
  const alreadySelected = room.selectedTeamPlayerIds.includes(playerId);

  let nextSelected: string[];

  if (alreadySelected) {
    nextSelected = room.selectedTeamPlayerIds.filter((id) => id !== playerId);
  } else {
    if (room.selectedTeamPlayerIds.length >= requiredTeamSize) return room;
    nextSelected = [...room.selectedTeamPlayerIds, playerId];
  }

  return {
    ...room,
    selectedTeamPlayerIds: nextSelected,
  };
}

export function startBuildingTeam(room: Room): Room {
  if (room.phase !== "discussion") return room;
  return {
    ...room,
    proposalStage: "teamBuilding",
  }
}

export function confirmTeamSelection(room: Room): Room {
  if (room.phase !== "discussion") return room;
  if (room.proposalStage !== "teamBuilding") return room;
  const requiredTeamSize = getRequiredTeamSize(room.players.length, room.questRound);
  if (room.selectedTeamPlayerIds.length !== requiredTeamSize) return room;
  const event : GameEvent = {
    id: room.eventCounter,
    type: "team_selected",
    leaderIndex: room.leaderIndex,
    teamPlayerIds: room.selectedTeamPlayerIds,
  }

  return {
    ...room,
    phase: "vote",
    proposalStage: "discussion",
    votes: {},
    eventCounter: room.eventCounter + 1,
    eventLog: [...room.eventLog, event],
  };
}

export function addPlayerToNextAvailableSeat(
  room: Room,
  player: Omit<Player, "seatIndex">
): Room {
  const occupied = new Set(room.players.map((p) => p.seatIndex));
  const nextSeat = Array.from({ length: 10 }, (_, i) => i).find(
    (i) => !occupied.has(i)
  );

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


export function submitVote(room: Room, playerId: string, vote: VoteChoice): Room {
  if (room.phase !== "vote") return room;
  if (room.votes[playerId]) return room;

  return {
    ...room,
    votes: {
      ...room.votes,
      [playerId]: vote,
    },
  };
}

export function resolveVote(room: Room): Room {
  const votes = Object.values(room.votes);
  const approveCount = votes.filter((v) => v === "approve").length;
  const rejectCount = votes.filter((v) => v === "reject").length;

  const votePassed = approveCount > rejectCount;

  const playersApproved: string[] = [];
  const playersRejected: string[] = [];

  for (const [playerId, vote] of Object.entries(room.votes)) {
    if (vote === "approve") {
      playersApproved.push(playerId);
    } else if (vote === "reject") {
      playersRejected.push(playerId);
    }
  }

  const event : GameEvent = {
    id: room.eventCounter,
    type: "vote_resolved",
    passed: votePassed,
    playerApproved: playersApproved,
    playerRejected: playersRejected,
  }

  if (votePassed) {
    return {      
        ...room,
        phase: "mission",
        questActions: {},
        eventCounter: room.eventCounter + 1,
        eventLog: [...room.eventLog, event],
    };
  }

  return {
      ...room,
    phase: "discussion",
    proposalRound: room.proposalRound + 1,
    leaderIndex: (room.leaderIndex + 1) % room.players.length,
    selectedTeamPlayerIds: [],
    votes: {},
    eventCounter: room.eventCounter + 1,
    eventLog: [...room.eventLog, event],
  };
}

export function submitQuestAction(room: Room, playerId: string, action: QuestAction): Room {
  if (room.phase !== "mission") return room;
  if (room.questActions[playerId]) return room;

  return {
    ...room,
    questActions: {
      ...room.questActions,
      [playerId]: action,
    },
  };
}

export function resolveQuest(room: Room): Room {
  const teamPlayerIds = room.selectedTeamPlayerIds;

  const successCount = teamPlayerIds.filter(
    (playerId) => room.questActions[playerId] === "success"
  ).length;

  const failCount = teamPlayerIds.filter(
    (playerId) => room.questActions[playerId] === "fail"
  ).length;

  const result: QuestDetail = {
    questRound: room.questRound,
    successCount,
    failCount,
    passed: failCount === 0,
    teamPlayerIds: [...teamPlayerIds],
    leaderPlayerId: room.players[room.leaderIndex].id,
  };
  
  const event : GameEvent = {
    id: room.eventCounter,
    type: "quest_resolved",
    questRound: room.questRound,
    failCardCount: failCount,
  }

  return {
    ...room,
    phase: "questResult",
    questDetails: [...room.questDetails, result],
    questActions: {},
    selectedTeamPlayerIds: [],
    votes: {},
    eventCounter: room.eventCounter + 1,
    eventLog: [...room.eventLog, event],
  };
}

export function getMissionScore(room: Room): {
  passedCount: number;
  failedCount: number;
} {
  const passedCount = room.questDetails.filter((r) => r.passed).length;
  const failedCount = room.questDetails.filter((r) => !r.passed).length;

  return { passedCount, failedCount };
}

export function advanceAfterQuestResult(room: Room): Room {
  const successCount = room.questDetails.filter((result) => result.passed).length;
  const failCount = room.questDetails.filter((result) => !result.passed).length;

  const isGameOver = successCount >= 3 || failCount >= 3;

  if (isGameOver) {
    return {
      ...room,
      phase: "gameOver",
    };
  }

  const event : GameEvent = {
    id: room.eventCounter,
    type: "leader_assigned",
    leaderIndex: (room.leaderIndex + 1) % room.players.length,
  }

  return {
    ...room,
    phase: "discussion",
    questRound: room.questRound + 1,
    proposalRound: 1,
    leaderIndex: (room.leaderIndex + 1) % room.players.length,
    selectedTeamPlayerIds: [],
    votes: {},
    questActions: {},
    eventCounter: room.eventCounter + 1,
    eventLog: [...room.eventLog, event],
  };
}

export function isGameOver(room: Room): boolean {
  const { passedCount, failedCount } = getMissionScore(room);
  return passedCount >= 3 || failedCount >= 3;
}

export function getWinner(room: Room): "Good" | "Evil" | null {
  const { passedCount, failedCount } = getMissionScore(room);

  if (passedCount >= 3) return "Good";
  if (failedCount >= 3) return "Evil";
  return null;
}


export function addBot(room: Room): Room {
  const botCount = room.players.filter((p) => p.type === "bot").length + 1;

  return addPlayerToNextAvailableSeat(room, {
    id: `bot-${botCount}`,
    name: `Bot ${botCount}`,
    type: "bot",
    isHost: false,
  });
}

export function fillAllSeatsWithBots(room: Room): Room {
  let nextRoom = room;
  const remaining = 10 - room.players.length;

  for (let i = 0; i < remaining; i++) {
    nextRoom = addBot(nextRoom);
  }

  return nextRoom;
}

function getSeatNumberByPlayerId(room: Room, playerId: string): number | null {
  const player = room.players.find((p) => p.id === playerId);
  return player ? player.seatIndex : null;
}

function getPlayerDisplayName(
  room: Room,
  playerId: string,
  myPlayerId: string
): string {
  if (playerId === myPlayerId) return "You";

  const seat = getSeatNumberByPlayerId(room, playerId);
  return seat !== null ? `${seat}` : "Unknown";
}