export type Page =
  | "home"
  | "room"
  | "game"
  | "gameOver"

export type Team = "good" | "evil";

export type Role =
  | "Merlin"
  | "Percival"
  | "Morgana"
  | "Assassin"
  | "Mordred"
  | "Oberon"
  | "Lancelot"
  | "Loyal Servant of Arthur"
  | "Minion of Mordred";

export type RoleCardID = number;

export type RoleCard = {
  id: RoleCardID;
  role: Role;
  team: Team;
  bref: string;
}

export const ROLE_CARD_DEFS: Record<RoleCardID, RoleCard> = {
  0: {
    id: 0,
    role: "Merlin",
    team: "good", 
    bref: "Merlin",
  },
  1: {
    id: 1,
    role: "Percival",
    team: "good",
    bref: "Percival",
  },
  2: {
    id: 2,
    role: "Assassin",
    team: "evil",
    bref: "Assassin",
  },
  3: {
    id: 3,
    role: "Morgana",
    team: "evil",
    bref: "Morgana",
  },
  4: {
    id: 4,
    role: "Mordred",
    team: "evil",
    bref: "Modred",
  },
  5: {
    id: 5,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  6: {
    id: 6,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  7: {
    id: 7,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  8: {
    id: 8,
    role: "Loyal Servant of Arthur",
    team: "good",
    bref: "Servant",
  },
  9: {
    id: 9,
    role: "Oberon",
    team: "evil",
    bref: "Oberon",
  },
  10: {
    id: 10,
    role: "Minion of Mordred",
    team: "evil",
    bref: "Minion",
  },
  11: {
    id: 11,
    role: "Lancelot",
    team: "good",
    bref: "Lancelot",
  },
  12: {
    id: 12,
    role: "Lancelot",
    team: "evil",
    bref: "Lancelot",
  },
}

export const ROLE_CARD_IDS = {
  MERLIN: 0,
  PERCIVAL: 1,
  ASSASSIN: 2,
  MORGANA: 3,
  MORDRED: 4,
  SERVANT_1: 5,
  SERVANT_2: 6,
  SERVANT_3: 7,
  SERVANT_4: 8,
  OBERON: 9, 
  MINION: 10,
  LANCELOT_GOOD: 11,
  LANCELOT_EVIL: 12,
} as const;

export type PlayerType = "human" | "bot";

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  type: PlayerType;
  isHost?: boolean;
  seatIndex: number;

  roleCardID?: RoleCardID;  
  role?: Role;
  team?: Team;
}



export type VoteChoice = "approve" | "reject";

export type QuestAction = "success" | "fail";

export type QuestResult = "success" | "fail";

export type QuestDetail = {
  questRound: number;
  successCount: number;
  failCount: number;
  passed: boolean;
  teamPlayerIds: string[];
  leaderPlayerId: string;
};

export type Phase =
  | "initializing"
  | "discussion"
  | "vote"
  | "mission"
  | "questResult"
  | "gameOver";

export type ProposalStage = "discussion" | "teamBuilding";



export type Room = {
  id: string;
  code: string;
  phase: Phase;
  proposalStage: ProposalStage;
  questRound: number;
  proposalRound: number;
  leaderIndex: number;
  players: Player[];
  selectedTeamPlayerIds: string[];
  votes: Record<string, VoteChoice>;
  questActions: Record<string, QuestAction>;
  questDetails: QuestDetail[];
  eventCounter: number;
  eventLog: GameEvent[];
};

export interface UIState {
  isVoteHistoryOpen: boolean;
  votePanelMinimized: boolean;
  missionPanelMinimized: boolean;
  showQuestResultModal: boolean;
}


export type SeatMetaInfo = {
  text: string;
  tone: "good" | "evil" | "neutral";
} | null;


type EventVisibility =
  | { kind: "public" }
  | { kind: "private_players"; playerIds: string[] }
  | { kind: "evil_team"; team: "good" | "evil" }
  | { kind: "private_player"; playerId: string };

export type GameEvent =
  | {
      id: number;
      type: "leader_assigned";
      leaderIndex: number;
    }
  | {
      id: number;
      type: "team_selected";
      leaderIndex: number;
      teamPlayerIds: string[];
    }
  | {
      id: number;
      type: "vote_resolved";
      passed: boolean;
      playerApproved: string[];
      playerRejected: string[];
    }
  | {
      id: number;
      type: "quest_resolved";
      questRound: number;
      failCardCount: number;
    }
  | {
      id: number;
      type: "assassination_initiated";
    };