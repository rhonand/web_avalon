import { ROLE_CARD_DEFS, ROLE_CARD_IDS } from "../../shared/types/roleCards";
import type { QuestAction, RoleCardID, VoteChoice } from "../../shared/types/sharedTypes";
import type { ServerGame, ServerGameEvent, ServerGamePlayerState, ServerRoom } from "./types/serverTypes.js";

const games = new Map<string, ServerGame>();

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function assembleRoleDeck(playerCount: number): RoleCardID[] {
  switch (playerCount) {
    case 5:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
      ];
    case 6:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
      ];
    case 7:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.OBERON,
      ];
    case 8:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.MINION,
      ];
    case 9:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.MORDRED,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.SERVANT_4,
      ];
    case 10:
      return [
        ROLE_CARD_IDS.MERLIN,
        ROLE_CARD_IDS.PERCIVAL,
        ROLE_CARD_IDS.ASSASSIN,
        ROLE_CARD_IDS.MORGANA,
        ROLE_CARD_IDS.MORDRED,
        ROLE_CARD_IDS.SERVANT_1,
        ROLE_CARD_IDS.SERVANT_2,
        ROLE_CARD_IDS.SERVANT_3,
        ROLE_CARD_IDS.SERVANT_4,
        ROLE_CARD_IDS.OBERON,
      ];
    default:
      throw new Error(`Unsupported player count: ${playerCount}`);
  }
}

function buildPlayerStates(room: ServerRoom): ServerGamePlayerState[] {
  const shuffledPlayers = shuffle(room.players);
  const shuffledDeck = shuffle(assembleRoleDeck(room.players.length));

  return shuffledPlayers.map((player, index) => {
    const roleCardID = shuffledDeck[index];
    const roleCard = ROLE_CARD_DEFS[roleCardID];

    return {
      playerId: player.id,
      roleCardID,
      role: roleCard.role,
      team: roleCard.team,
      seatIndex: index,
    };
  });
}

function createLeaderAssignedEvent(game: ServerGame): ServerGameEvent {
  return {
    event: {
      id: game.eventCounter,
      type: "leader_assigned",
      leaderIndex: game.leaderIndex,
    },
    visibility: { kind: "public" },
  };
}

function createLadyAssignedEvent(game: ServerGame): ServerGameEvent | null {
  if (!game.ladyPlayerId) {
    return null;
  }

  return {
    event: {
      id: game.eventCounter,
      type: "lady_assigned_public",
      playerId: game.ladyPlayerId,
    },
    visibility: {
      kind: "private_players",
      playerIds: game.playerStates
        .map((player) => player.playerId)
        .filter((playerId) => playerId !== game.ladyPlayerId),
    },
  };
}

function createLadyAssignedSelfEvent(game: ServerGame): ServerGameEvent | null {
  if (!game.ladyPlayerId) {
    return null;
  }

  return {
    event: {
      id: game.eventCounter,
      type: "lady_assigned_private_self",
      playerId: game.ladyPlayerId,
    },
    visibility: { kind: "private_player", playerId: game.ladyPlayerId },
  };
}

function createAssassinationInitiatedEvent(game: ServerGame): ServerGameEvent | null {
  if (!game.assassinPlayerId) {
    return null;
  }

  return {
    event: {
      id: game.eventCounter,
      type: "assassination_initiated",
      assassinPlayerId: game.assassinPlayerId,
    },
    visibility: { kind: "public" },
  };
}

function getPlayerState(game: ServerGame, playerId: string): ServerGamePlayerState | undefined {
  return game.playerStates.find((player) => player.playerId === playerId);
}

function requiredTeamSize(_playerCount: number, questRound: number): number {
  const sizes = [3, 4, 4, 5, 5];
  return sizes[questRound - 1] ?? 3;
}

function getLadyPlayerId(
  playerStates: ServerGamePlayerState[],
  leaderIndex: number
): string | null {
  if (playerStates.length === 0) {
    return null;
  }

  const ladySeatIndex =
    (leaderIndex - 1 + playerStates.length) % playerStates.length;
  return (
    playerStates.find((player) => player.seatIndex === ladySeatIndex)?.playerId ??
    null
  );
}

function pushEvent(game: ServerGame, entry: ServerGameEvent | null): void {
  if (!entry) {
    return;
  }

  game.eventLog.push(entry);
  game.eventCounter += 1;
}

function advanceToNextRound(game: ServerGame): void {
  game.phase = "discussion";
  game.proposalStage = "discussion";
  game.ladyStage = null;
  game.questRound += 1;
  game.proposalRound = 1;
  game.leaderIndex = (game.leaderIndex + 1) % game.playerStates.length;
  game.selectedTeamPlayerIds = [];
  game.votes = {};
  game.questActions = {};
  game.ladyTargetPlayerId = null;
  game.ladyResult = null;
  game.assassinationTargetPlayerId = null;
  pushEvent(game, createLeaderAssignedEvent(game));
}

function getAssassinPlayerId(game: ServerGame): string | null {
  return (
    game.playerStates.find((player) => player.role === "Assassin")?.playerId ?? null
  );
}

function getAssassinPlayerIdFromStates(
  playerStates: ServerGamePlayerState[]
): string | null {
  return playerStates.find((player) => player.role === "Assassin")?.playerId ?? null;
}

function resolveVote(game: ServerGame): void {
  const votes = Object.values(game.votes);
  const approveCount = votes.filter((vote) => vote === "approve").length;
  const rejectCount = votes.filter((vote) => vote === "reject").length;
  const passed = approveCount > rejectCount;

  const playerApproved: string[] = [];
  const playerRejected: string[] = [];

  for (const [playerId, vote] of Object.entries(game.votes)) {
    if (vote === "approve") {
      playerApproved.push(playerId);
    } else {
      playerRejected.push(playerId);
    }
  }

  game.eventLog.push({
    event: {
      id: game.eventCounter,
      type: "vote_resolved",
      passed,
      playerApproved,
      playerRejected,
    },
    visibility: { kind: "public" },
  });
  game.eventCounter += 1;

  if (passed) {
    game.phase = "mission";
    game.questActions = {};
    return;
  }

  game.phase = "discussion";
  game.proposalStage = "discussion";
  game.proposalRound += 1;
  game.selectedTeamPlayerIds = [];
  game.votes = {};
  game.leaderIndex = (game.leaderIndex + 1) % game.playerStates.length;
  game.questActions = {};
  game.eventLog.push(createLeaderAssignedEvent(game));
  game.eventCounter += 1;
}

function resolveQuest(game: ServerGame): void {
  const successCount = game.selectedTeamPlayerIds.filter(
    (playerId) => game.questActions[playerId] === "success"
  ).length;
  const failCount = game.selectedTeamPlayerIds.filter(
    (playerId) => game.questActions[playerId] === "fail"
  ).length;

  game.questDetails.push({
    questRound: game.questRound,
    successCount,
    failCount,
    passed: failCount === 0,
    teamPlayerIds: [...game.selectedTeamPlayerIds],
    leaderPlayerId: game.playerStates.find((player) => player.seatIndex === game.leaderIndex)?.playerId ?? "",
  });

  game.eventLog.push({
    event: {
      id: game.eventCounter,
      type: "quest_resolved",
      questRound: game.questRound,
      failCardCount: failCount,
    },
    visibility: { kind: "public" },
  });
  game.eventCounter += 1;
  game.phase = "questResult";
}

function advanceAfterQuestResult(game: ServerGame): void {
  const successCount = game.questDetails.filter((detail) => detail.passed).length;
  const failCount = game.questDetails.filter((detail) => !detail.passed).length;

  if (successCount >= 3) {
    game.phase = "assassinate";
    game.assassinPlayerId = getAssassinPlayerId(game);
    game.assassinationTargetPlayerId = null;
    pushEvent(game, createAssassinationInitiatedEvent(game));
    return;
  }

  if (failCount >= 3) {
    game.winner = "evil";
    game.phase = "gameOver";
    return;
  }

  if ([1, 2, 3, 4].includes(game.questRound) && game.ladyPlayerId) {
    game.phase = "lady";
    game.ladyStage = "selecting";
    game.ladyTargetPlayerId = null;
    game.ladyResult = null;
    return;
  }

  advanceToNextRound(game);
}

function advanceAfterLadyResult(game: ServerGame): void {
  const currentLadyPlayerId = game.ladyPlayerId;

  if (!game.ladyResult) {
    advanceToNextRound(game);
    return;
  }

  game.ladyPlayerId = currentLadyPlayerId;
  game.ladyStage = null;
  game.ladyTargetPlayerId = null;
  game.ladyResult = null;
  advanceToNextRound(game);
}

export function createGame(room: ServerRoom): ServerGame {
  const playerStates = buildPlayerStates(room);
  const leaderIndex = Math.floor(Math.random() * playerStates.length);
  const ladyPlayerId = room.hostPlayerId;

  const game: ServerGame = {
    id: crypto.randomUUID(),
    roomId: room.id,
    code: room.code,
    phase: "initializing",
    proposalStage: "discussion",
    ladyStage: null,
    questRound: 1,
    proposalRound: 1,
    leaderIndex,
    ladyPlayerId,
    ladyTargetPlayerId: null,
    ladyResult: null,
    ladyKnowledge: {},
    assassinPlayerId: getAssassinPlayerIdFromStates(playerStates),
    assassinationTargetPlayerId: null,
    winner: null,
    playerStates,
    selectedTeamPlayerIds: [],
    votes: {},
    questActions: {},
    questDetails: [],
    eventCounter: 0,
    eventLog: [],
  };

  pushEvent(game, createLeaderAssignedEvent(game));
  pushEvent(game, createLadyAssignedSelfEvent(game));
  pushEvent(game, createLadyAssignedEvent(game));

  games.set(room.id, game);
  return game;
}

export function submitAssassination(
  roomId: string,
  playerId: string,
  targetPlayerId: string
): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "assassinate") {
    return { error: "Assassination is not available right now." };
  }

  if (game.assassinPlayerId !== playerId) {
    return { error: "Only the Assassin can perform the assassination." };
  }

  const target = getPlayerState(game, targetPlayerId);
  if (!target) {
    return { error: "Target player not found." };
  }

  game.assassinationTargetPlayerId = targetPlayerId;
  const success = target.role === "Merlin";
  game.winner = success ? "evil" : "good";
  pushEvent(game, {
    event: {
      id: game.eventCounter,
      type: "assassination_resolved",
      assassinPlayerId: playerId,
      targetPlayerId,
      success,
    },
    visibility: { kind: "public" },
  });
  game.phase = "gameOver";
  return { game };
}

export function getGameByRoomId(roomId: string): ServerGame | undefined {
  return games.get(roomId);
}

export function advanceGameToDiscussion(roomId: string): ServerGame | undefined {
  const game = games.get(roomId);
  if (!game) {
    return undefined;
  }

  if (game.phase === "initializing") {
    game.phase = "discussion";
  }

  return game;
}

export function startTeamBuilding(roomId: string, playerId: string): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  const leader = game.playerStates.find((player) => player.seatIndex === game.leaderIndex);
  if (!leader || leader.playerId !== playerId) {
    return { error: "Only the current leader can start team building." };
  }

  if (game.phase !== "discussion" || game.proposalStage !== "discussion") {
    return { error: "Team building is not available right now." };
  }

  game.proposalStage = "teamBuilding";
  game.selectedTeamPlayerIds = [];
  return { game };
}

export function submitLadyTest(
  roomId: string,
  playerId: string,
  targetPlayerId: string
): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "lady" || game.ladyStage !== "selecting") {
    return { error: "Lady of the Lake is not available right now." };
  }

  if (game.ladyPlayerId !== playerId) {
    return { error: "Only the current Lady of the Lake can test a player." };
  }

  if (targetPlayerId === playerId) {
    return { error: "You must choose another player." };
  }

  const target = getPlayerState(game, targetPlayerId);
  if (!target) {
    return { error: "Target player not found." };
  }

  const otherPlayerIds = game.playerStates
    .map((player) => player.playerId)
    .filter((id) => id !== playerId && id !== targetPlayerId);

  game.ladyTargetPlayerId = targetPlayerId;
  game.ladyStage = "result";
  game.ladyResult = {
    id: game.eventCounter,
    actorPlayerId: playerId,
    targetPlayerId,
    revealedTeam: target.team,
  };
  game.ladyKnowledge[playerId] = {
    ...(game.ladyKnowledge[playerId] ?? {}),
    [targetPlayerId]: target.team,
  };

  if (otherPlayerIds.length > 0) {
    pushEvent(game, {
      event: {
        id: game.eventCounter,
        type: "lady_tested_public",
        actorPlayerId: playerId,
        targetPlayerId,
      },
      visibility: { kind: "private_players", playerIds: otherPlayerIds },
    });
  }

  pushEvent(game, {
    event: {
      id: game.eventCounter,
      type: "lady_tested_private_lady",
      actorPlayerId: playerId,
      targetPlayerId,
      revealedTeam: target.team,
    },
    visibility: { kind: "private_player", playerId },
  });

  pushEvent(game, {
    event: {
      id: game.eventCounter,
      type: "lady_tested_private_target",
      actorPlayerId: playerId,
      targetPlayerId,
      revealedTeam: target.team,
    },
    visibility: { kind: "private_player", playerId: targetPlayerId },
  });

  return { game };
}

export function proposeTeam(
  roomId: string,
  playerId: string,
  teamPlayerIds: string[]
): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  const leader = game.playerStates.find((player) => player.seatIndex === game.leaderIndex);
  if (!leader || leader.playerId !== playerId) {
    return { error: "Only the current leader can confirm the team." };
  }

  if (game.phase !== "discussion" || game.proposalStage !== "teamBuilding") {
    return { error: "Team confirmation is not available right now." };
  }

  const uniqueTeamPlayerIds = [...new Set(teamPlayerIds)];
  const expectedTeamSize = requiredTeamSize(game.playerStates.length, game.questRound);
  if (uniqueTeamPlayerIds.length !== expectedTeamSize) {
    return { error: `You must select exactly ${expectedTeamSize} players.` };
  }

  const allPlayerIds = new Set(game.playerStates.map((player) => player.playerId));
  const hasUnknownPlayer = uniqueTeamPlayerIds.some((id) => !allPlayerIds.has(id));
  if (hasUnknownPlayer) {
    return { error: "The proposed team contains an unknown player." };
  }

  game.selectedTeamPlayerIds = uniqueTeamPlayerIds;
  game.phase = game.proposalRound >= 5 ? "mission" : "vote";
  game.proposalStage = "discussion";
  game.votes = {};
  game.questActions = {};
  game.eventLog.push({
    event: {
      id: game.eventCounter,
      type: "team_selected",
      leaderIndex: game.leaderIndex,
      teamPlayerIds: uniqueTeamPlayerIds,
    },
    visibility: { kind: "public" },
  });
  game.eventCounter += 1;

  if (game.phase === "mission") {
    game.eventLog.push({
      event: {
        id: game.eventCounter,
        type: "vote_resolved",
        passed: true,
        playerApproved: [],
        playerRejected: [],
      },
      visibility: { kind: "public" },
    });
    game.eventCounter += 1;
  }

  return { game };
}

export function submitVote(
  roomId: string,
  playerId: string,
  vote: VoteChoice
): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "vote") {
    return { error: "Voting is not available right now." };
  }

  if (game.votes[playerId]) {
    return { error: "You have already voted." };
  }

  game.votes[playerId] = vote;

  const everyoneVoted = game.playerStates.every((player) => Boolean(game.votes[player.playerId]));
  if (everyoneVoted) {
    resolveVote(game);
  }

  return { game };
}

export function submitQuestAction(
  roomId: string,
  playerId: string,
  action: QuestAction
): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "mission") {
    return { error: "Quest actions are not available right now." };
  }

  if (!game.selectedTeamPlayerIds.includes(playerId)) {
    return { error: "Only players on the quest team can submit an action." };
  }

  if (game.questActions[playerId]) {
    return { error: "You have already submitted your quest action." };
  }

  const playerState = game.playerStates.find((player) => player.playerId === playerId);
  const resolvedPlayerState = playerState ?? getPlayerState(game, playerId);
  if (!resolvedPlayerState) {
    return { error: "Player not found in game." };
  }

  if (resolvedPlayerState.team === "good" && action === "fail") {
    return { error: "Good players cannot submit Fail." };
  }

  game.questActions[playerId] = action;

  const everyoneSubmitted = game.selectedTeamPlayerIds.every(
    (teamPlayerId) => Boolean(game.questActions[teamPlayerId])
  );
  if (everyoneSubmitted) {
    resolveQuest(game);
  }

  return { game };
}

export function continueAfterQuestResult(roomId: string): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "questResult") {
    return { error: "Quest result cannot be dismissed right now." };
  }

  advanceAfterQuestResult(game);
  return { game };
}

export function continueAfterLadyResult(roomId: string): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "lady" || game.ladyStage !== "result") {
    return { error: "Lady result cannot be dismissed right now." };
  }

  advanceAfterLadyResult(game);
  return { game };
}

export function applyVoteTimeout(roomId: string): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "vote") {
    return { game };
  }

  for (const player of game.playerStates) {
    if (!game.votes[player.playerId]) {
      game.votes[player.playerId] = "approve";
    }
  }

  resolveVote(game);
  return { game };
}

export function applyMissionTimeout(roomId: string): { game?: ServerGame; error?: string } {
  const game = games.get(roomId);
  if (!game) {
    return { error: "Game not found." };
  }

  if (game.phase !== "mission") {
    return { game };
  }

  for (const playerId of game.selectedTeamPlayerIds) {
    if (game.questActions[playerId]) {
      continue;
    }

    const playerState = getPlayerState(game, playerId);
    if (!playerState) {
      continue;
    }

    game.questActions[playerId] = playerState.team === "evil" ? "fail" : "success";
  }

  resolveQuest(game);
  return { game };
}

export function returnGameToRoom(roomId: string): void {
  games.delete(roomId);
}

export function getPendingBotAction(room: ServerRoom): (() => void) | null {
  const game = games.get(room.id);
  if (
    !game ||
    game.phase === "initializing" ||
    game.phase === "questResult" ||
    game.phase === "gameOver" ||
    (game.phase === "lady" && game.ladyStage === "result")
  ) {
    return null;
  }

  const leader = game.playerStates.find((player) => player.seatIndex === game.leaderIndex);
  if (!leader) {
    return null;
  }

  const leaderRoomPlayer = room.players.find((player) => player.id === leader.playerId);

  if (
    game.phase === "discussion" &&
    game.proposalStage === "discussion" &&
    leaderRoomPlayer?.type === "bot"
  ) {
    return () => {
      game.proposalStage = "teamBuilding";
      game.selectedTeamPlayerIds = [];
    };
  }

  if (
    game.phase === "discussion" &&
    game.proposalStage === "teamBuilding" &&
    leaderRoomPlayer?.type === "bot"
  ) {
    return () => {
      const requiredSize = requiredTeamSize(game.playerStates.length, game.questRound);
      const otherPlayerIds = shuffle(
        game.playerStates
          .filter((player) => player.playerId !== leader.playerId)
          .map((player) => player.playerId)
      );
      const proposedTeam = [leader.playerId, ...otherPlayerIds].slice(0, requiredSize);
      void proposeTeam(room.id, leader.playerId, proposedTeam);
    };
  }

  if (game.phase === "vote") {
    const pendingBot = room.players.find(
      (player) => player.type === "bot" && !game.votes[player.id]
    );

    if (pendingBot) {
      return () => {
        void submitVote(room.id, pendingBot.id, "approve");
      };
    }
  }

  if (game.phase === "mission") {
    const pendingBot = room.players.find(
      (player) =>
        player.type === "bot" &&
        game.selectedTeamPlayerIds.includes(player.id) &&
        !game.questActions[player.id]
    );

    if (pendingBot) {
      return () => {
        const botState = getPlayerState(game, pendingBot.id);
        const action: QuestAction = botState?.team === "evil" ? "fail" : "success";
        void submitQuestAction(room.id, pendingBot.id, action);
      };
    }
  }

  if (game.phase === "lady" && game.ladyStage === "selecting" && game.ladyPlayerId) {
    const ladyRoomPlayer = room.players.find((player) => player.id === game.ladyPlayerId);
    if (ladyRoomPlayer?.type === "bot") {
      return () => {
        const targetIds = shuffle(
          game.playerStates
            .filter((player) => player.playerId !== game.ladyPlayerId)
            .map((player) => player.playerId)
        );
        const targetPlayerId = targetIds[0];
        if (targetPlayerId) {
          void submitLadyTest(room.id, game.ladyPlayerId!, targetPlayerId);
        }
      };
    }
  }

  if (game.phase === "assassinate" && game.assassinPlayerId) {
    const assassinRoomPlayer = room.players.find(
      (player) => player.id === game.assassinPlayerId
    );
    if (assassinRoomPlayer?.type === "bot") {
      return () => {
        const targetIds = shuffle(
          game.playerStates
            .filter((player) => player.team === "good")
            .map((player) => player.playerId)
        );
        const targetPlayerId = targetIds[0];
        if (targetPlayerId) {
          void submitAssassination(room.id, game.assassinPlayerId!, targetPlayerId);
        }
      };
    }
  }

  return null;
}

export function removeGameByRoomId(roomId: string): void {
  games.delete(roomId);
}
