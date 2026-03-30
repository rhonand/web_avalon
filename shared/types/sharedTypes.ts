export type PlayerType = "human" | "bot";

export type RoomStatus = "lobby" | "in_game";

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

export type VoteChoice = "approve" | "reject";

export type QuestAction = "success" | "fail";

export type GamePhase =
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

export type QuestDetail = {
  questRound: number;
  successCount: number;
  failCount: number;
  passed: boolean;
  teamPlayerIds: string[];
  leaderPlayerId: string;
};

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

export type EventVisibility =
  | { kind: "public" }
  | { kind: "private_player"; playerId: string }
  | { kind: "private_players"; playerIds: string[] }
  | { kind: "team"; team: Team };

export type RoomPlayerView = {
  id: string;
  name: string;
  isHost: boolean;
  type: PlayerType;
  seatIndex: number;
};

export type RoomView = {
  id: string;
  code: string;
  createdAt: number;
  status: RoomStatus;
  hostPlayerId: string;
  activeGameId: string | null;
  players: RoomPlayerView[];
};

export type GamePlayerView = {
  id: string;
  name: string;
  type: PlayerType;
  isHost: boolean;
  seatIndex: number;
  roleCardID?: RoleCardID;
  role?: Role;
  team?: Team;
};

export type GameStateView = {
  id: string;
  roomId: string;
  code: string;
  phase: GamePhase;
  proposalStage: ProposalStage;
  ladyStage: LadyStage | null;
  questRound: number;
  proposalRound: number;
  leaderIndex: number;
  ladyPlayerId: string | null;
  formerLadyPlayerIds: string[];
  ladyTargetPlayerId: string | null;
  ladyResult: { id: number; text: string } | null;
  ladyKnowledge: Record<string, Team>;
  assassinPlayerId: string | null;
  assassinationTargetPlayerId: string | null;
  winner: Team | null;
  players: GamePlayerView[];
  selectedTeamPlayerIds: string[];
  votes: Record<string, VoteChoice>;
  questActions: Record<string, QuestAction>;
  questDetails: QuestDetail[];
  eventCounter: number;
  eventLog: GameEvent[];
};

export type CreateRoomResponse =
  | { ok: true; room: RoomView; playerId: string }
  | { ok: false; message: string };

export type JoinRoomResponse =
  | { ok: true; room: RoomView; playerId: string }
  | { ok: false; message: string };

export type LeaveRoomResponse =
  | { ok: true }
  | { ok: false; message: string };

export type StartGameResponse =
  | { ok: true; room: RoomView; game: GameStateView }
  | { ok: false; message: string };

export type GameActionResponse =
  | { ok: true }
  | { ok: false; message: string };

export type AddBotResponse =
  | { ok: true; room: RoomView }
  | { ok: false; message: string };

export type FillSeatsWithBotsResponse =
  | { ok: true; room: RoomView }
  | { ok: false; message: string };

export type ClientToServerEvents = {
  "room:create": (
    payload: { playerName: string },
    callback: (response: CreateRoomResponse) => void
  ) => void;
  "room:join": (
    payload: { roomId: string; playerName: string },
    callback: (response: JoinRoomResponse) => void
  ) => void;
  "room:leave": (
    payload: { roomId: string },
    callback: (response: LeaveRoomResponse) => void
  ) => void;
  "room:add_bot": (
    payload: { roomId: string },
    callback: (response: AddBotResponse) => void
  ) => void;
  "room:fill_bots": (
    payload: { roomId: string },
    callback: (response: FillSeatsWithBotsResponse) => void
  ) => void;
  "game:start": (
    payload: { roomId: string },
    callback: (response: StartGameResponse) => void
  ) => void;
  "game:start_team_building": (
    payload: { roomId: string },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:propose_team": (
    payload: { roomId: string; teamPlayerIds: string[] },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:vote": (
    payload: { roomId: string; vote: VoteChoice },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:quest_action": (
    payload: { roomId: string; action: QuestAction },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:lady_test": (
    payload: { roomId: string; targetPlayerId: string },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:assassinate": (
    payload: { roomId: string; targetPlayerId: string },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:continue_after_quest_result": (
    payload: { roomId: string },
    callback: (response: GameActionResponse) => void
  ) => void;
  "game:return_to_room": (
    payload: { roomId: string },
    callback: (response: GameActionResponse) => void
  ) => void;
};

export type ServerToClientEvents = {
  "room:updated": (room: RoomView) => void;
  "game:updated": (game: GameStateView) => void;
  "game:destroyed": (payload: { roomId: string }) => void;
};
