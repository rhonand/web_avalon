import type { Room } from "../types/gameTypes";

export function createInitialRoom(): Room {
  return {
    id: crypto.randomUUID(),
    code: generateRoomCode(),
    phase: "discussion",
    proposalStage: "discussion",
    ladyStage: null,
    questRound: 1,
    proposalRound: 1,
    leaderIndex: 0,
    ladyPlayerId: "bot-5",
    formerLadyPlayerIds: ["bot-5"],
    ladyTargetPlayerId: null,
    ladyResult: null,
    ladyKnowledge: {},
    assassinPlayerId: "bot-5",
    assassinationTargetPlayerId: null,
    winner: null,
    players: [
      { id: "me", name: "You", type: "human", isHost: true, seatIndex: 0 },
      { id: "bot-1", name: "Bot 1", type: "bot", isHost: false, seatIndex: 1 },
      { id: "bot-2", name: "Bot 2", type: "bot", isHost: false, seatIndex: 2, team: "good" },
      { id: "bot-3", name: "Bot 3", type: "bot", isHost: false, seatIndex: 3, team: "good" },
      { id: "bot-4", name: "Bot 4", type: "bot", isHost: false, seatIndex: 4, team: "good" },
      { id: "bot-5", name: "Bot 5", type: "bot", isHost: false, seatIndex: 5, team: "evil" },
     // { id: "bot-6", name: "Bot 6", type: "bot", isHost: false, seatIndex: 6, team: "evil" },
      //{ id: "bot-7", name: "Bot 7", type: "bot", isHost: false, seatIndex: 7, team: "evil" },
      //{ id: "bot-8", name: "Bot 8", type: "bot", isHost: false, seatIndex: 8, team: "good" },
      //{ id: "bot-9", name: "Bot 9", type: "bot", isHost: false, seatIndex: 9, team: "good" },
    ],
    selectedTeamPlayerIds: [],
    votes: {},
    questActions: {},
    questDetails: [],
    eventCounter: 0,
    eventLog: [],
  };
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
