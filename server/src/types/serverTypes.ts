import type {
  EventVisibility,
  GameEvent,
  GamePhase,
  GamePlayerView,
  GameStateView,
  LadyStage,
  PlayerType,
  ProposalStage,
  QuestAction,
  QuestDetail,
  Role,
  RoleCardID,
  RoomStatus,
  RoomView,
  Team,
  VoteChoice,
} from "../../../shared/types/sharedTypes";

export type ServerRoomPlayer = {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  type: PlayerType;
  seatIndex: number;
};

export type ServerRoom = {
  id: string;
  code: string;
  createdAt: number;
  status: RoomStatus;
  hostPlayerId: string;
  activeGameId: string | null;
  players: ServerRoomPlayer[];
};

export type ServerGamePlayerState = {
  playerId: string;
  roleCardID: RoleCardID;
  role: Role;
  team: Team;
  seatIndex: number;
};

export type ServerGameEvent = {
  event: GameEvent;
  visibility: EventVisibility;
};

export type ServerGame = {
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
  ladyResult: {
    id: number;
    actorPlayerId: string;
    targetPlayerId: string;
    revealedTeam: Team;
  } | null;
  ladyKnowledge: Record<string, Record<string, Team>>;
  assassinPlayerId: string | null;
  assassinationTargetPlayerId: string | null;
  winner: Team | null;
  playerStates: ServerGamePlayerState[];
  selectedTeamPlayerIds: string[];
  votes: Record<string, VoteChoice>;
  questActions: Record<string, QuestAction>;
  questDetails: QuestDetail[];
  eventCounter: number;
  eventLog: ServerGameEvent[];
};

export function toRoomView(room: ServerRoom): RoomView {
  return {
    id: room.id,
    code: room.code,
    createdAt: room.createdAt,
    status: room.status,
    hostPlayerId: room.hostPlayerId,
    activeGameId: room.activeGameId,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      type: player.type,
      seatIndex: player.seatIndex,
    })),
  };
}

function canViewerSeePlayerState(
  game: ServerGame,
  viewerState: ServerGamePlayerState,
  targetState: ServerGamePlayerState
): boolean {
  if (game.phase === "gameOver") {
    return true;
  }

  if (viewerState.playerId === targetState.playerId) {
    return true;
  }

  if (game.phase === "assassinate") {
    return targetState.team === "evil";
  }

  if (viewerState.role === "Merlin") {
    return targetState.team === "evil" && targetState.role !== "Mordred";
  }

  if (viewerState.role === "Percival") {
    return targetState.role === "Merlin" || targetState.role === "Morgana";
  }

  if (viewerState.team === "evil" && viewerState.role !== "Oberon") {
    return targetState.team === "evil" && targetState.role !== "Oberon";
  }

  return false;
}

function canViewerSeeEvent(
  viewerState: ServerGamePlayerState,
  visibility: EventVisibility
): boolean {
  switch (visibility.kind) {
    case "public":
      return true;
    case "private_player":
      return visibility.playerId === viewerState.playerId;
    case "private_players":
      return visibility.playerIds.includes(viewerState.playerId);
    case "team":
      return visibility.team === viewerState.team;
    default:
      return false;
  }
}

export function toGameView(
  game: ServerGame,
  room: ServerRoom,
  viewerPlayerId: string
): GameStateView {
  const viewerState = game.playerStates.find((player) => player.playerId === viewerPlayerId);

  const players: GamePlayerView[] = room.players
    .map((roomPlayer) => {
      const gameState = game.playerStates.find((player) => player.playerId === roomPlayer.id);

      if (!gameState) {
        return {
          id: roomPlayer.id,
          name: roomPlayer.name,
          type: roomPlayer.type,
          isHost: roomPlayer.isHost,
          seatIndex: roomPlayer.seatIndex,
        };
      }

      const basePlayer: GamePlayerView = {
        id: roomPlayer.id,
        name: roomPlayer.name,
        type: roomPlayer.type,
        isHost: roomPlayer.isHost,
        seatIndex: gameState.seatIndex,
      };

      if (!viewerState) {
        return basePlayer;
      }

      if (!canViewerSeePlayerState(game, viewerState, gameState)) {
        return basePlayer;
      }

      return {
        ...basePlayer,
        roleCardID: gameState.roleCardID,
        role: gameState.role,
        team: gameState.team,
      };
    })
    .sort((a, b) => a.seatIndex - b.seatIndex);

  const visibleEvents = viewerState
    ? game.eventLog
        .filter((entry) => canViewerSeeEvent(viewerState, entry.visibility))
        .map((entry) => entry.event)
    : [];

  const visibleVotes =
    game.phase === "vote" && game.votes[viewerPlayerId]
      ? { [viewerPlayerId]: game.votes[viewerPlayerId] }
      : {};

  const visibleQuestActions =
    game.phase === "mission" && game.questActions[viewerPlayerId]
      ? { [viewerPlayerId]: game.questActions[viewerPlayerId] }
      : {};

  let ladyResult: GameStateView["ladyResult"] = null;
  if (game.phase === "lady" && game.ladyStage === "result" && game.ladyResult) {
    const actor = game.playerStates.find(
      (player) => player.playerId === game.ladyResult?.actorPlayerId
    );
    const target = game.playerStates.find(
      (player) => player.playerId === game.ladyResult?.targetPlayerId
    );
    const actorSeat = actor ? actor.seatIndex + 1 : "?";
    const targetSeat = target ? target.seatIndex + 1 : "?";

    if (viewerPlayerId === game.ladyResult.actorPlayerId) {
      ladyResult = {
        id: game.ladyResult.id,
        text: `Player ${targetSeat} is on the ${game.ladyResult.revealedTeam} side.`,
      };
    } else if (viewerPlayerId === game.ladyResult.targetPlayerId) {
      ladyResult = {
        id: game.ladyResult.id,
        text: `Player ${actorSeat} learned that you are on the ${game.ladyResult.revealedTeam} side.`,
      };
    } else {
      ladyResult = {
        id: game.ladyResult.id,
        text: `Player ${actorSeat} tested the loyalty of Player ${targetSeat}.`,
      };
    }
  }

  return {
    id: game.id,
    roomId: game.roomId,
    code: game.code,
    phase: game.phase,
    proposalStage: game.proposalStage,
    ladyStage: game.ladyStage,
    questRound: game.questRound,
    proposalRound: game.proposalRound,
    leaderIndex: game.leaderIndex,
    ladyPlayerId: game.ladyPlayerId,
    formerLadyPlayerIds: game.formerLadyPlayerIds,
    ladyTargetPlayerId: game.ladyTargetPlayerId,
    ladyResult,
    ladyKnowledge: viewerPlayerId ? game.ladyKnowledge[viewerPlayerId] ?? {} : {},
    assassinPlayerId: game.assassinPlayerId,
    assassinationTargetPlayerId: game.assassinationTargetPlayerId,
    winner: game.winner,
    players,
    selectedTeamPlayerIds: game.selectedTeamPlayerIds,
    votes: visibleVotes,
    questActions: visibleQuestActions,
    questDetails: game.questDetails,
    eventCounter: game.eventCounter,
    eventLog: visibleEvents,
  };
}
