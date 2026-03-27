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

export type { RoleCard } from "../../../shared/types/roleCards";
export { ROLE_CARD_DEFS, ROLE_CARD_IDS } from "../../../shared/types/roleCards";

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
  | "lady"
  | "assassinate"
  | "questResult"
  | "gameOver";

export type ProposalStage = "discussion" | "teamBuilding";
export type LadyStage = "selecting" | "result";



export type Room = {
  id: string;
  code: string;
  phase: Phase;
  proposalStage: ProposalStage;
  ladyStage: LadyStage | null;
  questRound: number;
  proposalRound: number;
  leaderIndex: number;
  ladyPlayerId: string | null;
  ladyTargetPlayerId: string | null;
  ladyResult: { id: number; text: string } | null;
  ladyKnowledge: Record<string, Team>;
  assassinPlayerId: string | null;
  assassinationTargetPlayerId: string | null;
  winner: Team | null;
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


export type EventVisibility =
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
      type: "lady_tested_public";
      actorPlayerId: string;
      targetPlayerId: string;
    }
  | {
      id: number;
      type: "lady_tested_private_lady";
      actorPlayerId: string;
      targetPlayerId: string;
      revealedTeam: Team;
    }
  | {
      id: number;
      type: "lady_tested_private_target";
      actorPlayerId: string;
      targetPlayerId: string;
      revealedTeam: Team;
    }
  | {
      id: number;
      type: "lady_assigned_public";
      playerId: string;
    }
  | {
      id: number;
      type: "lady_assigned_private_self";
      playerId: string;
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
      assassinPlayerId: string;
    }
  | {
      id: number;
      type: "assassination_resolved";
      assassinPlayerId: string;
      targetPlayerId: string;
      success: boolean;
    };
