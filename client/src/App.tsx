import { useEffect, useState } from "react";

import { getRequiredTeamSize } from "./engine/gameEngine";
import type {
  AddBotResponse,
  CreateRoomResponse,
  FillSeatsWithBotsResponse,
  GameActionResponse,
  GameStateView,
  JoinRoomResponse,
  LeaveRoomResponse,
  Page,
  RoomView,
  StartGameResponse,
} from "./types/networkTypes";
import { socket } from "./socket/socket";
import HomePage from "./pages/HomePage";
import GameRoomPage from "./pages/GameRoomPage";
import GameBoardPage from "./pages/GameBoardPage";
import GameOverPage from "./pages/GameOverPage";
import { sanitizePlayerMarkAssignments } from "./engine/playerMarkLibrary";
import type { PlayerMarkAssignment } from "./types/playerMarks";

const PLAYER_MARK_STORAGE_KEY = "avalon-player-marks";

function loadStoredPlayerMarks(): Record<string, PlayerMarkAssignment> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PLAYER_MARK_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Record<string, PlayerMarkAssignment>;
  } catch {
    return {};
  }
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [room, setRoom] = useState<RoomView | null>(null);
  const [game, setGame] = useState<GameStateView | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [playerMarksByGame, setPlayerMarksByGame] =
    useState<Record<string, PlayerMarkAssignment>>(loadStoredPlayerMarks);

  useEffect(() => {
    socket.connect();

    const onConnectError = (err: Error) => {
      setError(`Connect error: ${err.message}`);
    };

    const onRoomUpdated = (updatedRoom: RoomView) => {
      setRoom(updatedRoom);
    };

    const onGameUpdated = (updatedGame: GameStateView) => {
      setGame(updatedGame);
      setPlayerMarksByGame((current) => {
        const currentAssignments = current[updatedGame.id] ?? {};
        const nextAssignments = sanitizePlayerMarkAssignments(
          currentAssignments,
          updatedGame.players.map((player) => player.id),
          updatedGame.players.length
        );

        return {
          ...current,
          [updatedGame.id]: nextAssignments,
        };
      });
    };

    const onGameDestroyed = ({ roomId }: { roomId: string }) => {
      setGame((currentGame) => {
        if (!currentGame || currentGame.roomId !== roomId) {
          return currentGame;
        }

        return null;
      });
    };

    socket.on("connect_error", onConnectError);
    socket.on("room:updated", onRoomUpdated);
    socket.on("game:updated", onGameUpdated);
    socket.on("game:destroyed", onGameDestroyed);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("room:updated", onRoomUpdated);
      socket.off("game:updated", onGameUpdated);
      socket.off("game:destroyed", onGameDestroyed);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (game) {
      setPage("game");
      return;
    }

    if (room) {
      setPage("room");
      return;
    }

    setPage("home");
  }, [game, room]);

  useEffect(() => {
    window.localStorage.setItem(
      PLAYER_MARK_STORAGE_KEY,
      JSON.stringify(playerMarksByGame)
    );
  }, [playerMarksByGame]);

  const handleCreate = () => {
    setError("");

    socket.emit("room:create", { playerName }, (res: CreateRoomResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setMyPlayerId(res.playerId);
      setJoinRoomId(res.room.code);
    });
  };

  const handleJoin = () => {
    setError("");

    socket.emit("room:join", { roomId: joinRoomId, playerName }, (res: JoinRoomResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setMyPlayerId(res.playerId);
      setJoinRoomId(res.room.code);
    });
  };

  const handleLeaveRoom = () => {
    if (!room) {
      setRoom(null);
      setGame(null);
      setError("");
      return;
    }

    setError("");
    socket.emit("room:leave", { roomId: room.code }, (res: LeaveRoomResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(null);
      setGame(null);
      setMyPlayerId(null);
      setJoinRoomId("");
      setError("");
    });
  };

  const handleStartGame = () => {
    if (!room) {
      setError("Room not found.");
      return;
    }

    setError("");

    socket.emit("game:start", { roomId: room.code }, (res: StartGameResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setGame(res.game);
    });
  };

  const handleAddBot = () => {
    if (!room) {
      setError("Room not found.");
      return;
    }

    setError("");
    socket.emit("room:add_bot", { roomId: room.code }, (res: AddBotResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
    });
  };

  const handleFillAllSeatsWithBots = () => {
    if (!room) {
      setError("Room not found.");
      return;
    }

    setError("");
    socket.emit("room:fill_bots", { roomId: room.code }, (res: FillSeatsWithBotsResponse) => {
      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
    });
  };

  const handleBoardSeatClick = (playerId: string) => {
    setGame((prev) => {
      if (!prev || !myPlayerId) {
        return prev;
      }

      if (
        prev.phase === "lady" &&
        prev.ladyStage === "selecting" &&
        prev.ladyPlayerId === myPlayerId
      ) {
        if (
          playerId === myPlayerId ||
          prev.formerLadyPlayerIds.includes(playerId)
        ) {
          return prev;
        }

        return {
          ...prev,
          ladyTargetPlayerId:
            prev.ladyTargetPlayerId === playerId ? null : playerId,
        };
      }

      if (prev.phase === "assassinate" && prev.assassinPlayerId === myPlayerId) {
        const target = prev.players.find((player) => player.id === playerId);
        if (!target || target.team === "evil" || playerId === myPlayerId) {
          return prev;
        }

        return {
          ...prev,
          assassinationTargetPlayerId:
            prev.assassinationTargetPlayerId === playerId ? null : playerId,
        };
      }

      const leader = prev.players[prev.leaderIndex];
      const amILeader = leader?.id === myPlayerId;
      if (
        prev.phase !== "discussion" ||
        prev.proposalStage !== "teamBuilding" ||
        !amILeader
      ) {
        return prev;
      }

      const requiredTeamSize = getRequiredTeamSize(prev.players.length, prev.questRound);
      const alreadySelected = prev.selectedTeamPlayerIds.includes(playerId);

      let nextSelected: string[];

      if (alreadySelected) {
        nextSelected = prev.selectedTeamPlayerIds.filter((id) => id !== playerId);
      } else {
        if (prev.selectedTeamPlayerIds.length >= requiredTeamSize) {
          return prev;
        }

        nextSelected = [...prev.selectedTeamPlayerIds, playerId];
      }

      return {
        ...prev,
        selectedTeamPlayerIds: nextSelected,
      };
    });
  };

  const handleStartBuildingTeam = () => {
    if (!game) {
      setError("Game not found.");
      return;
    }

    setError("");
    socket.emit("game:start_team_building", { roomId: game.code }, (res: GameActionResponse) => {
      if (!res.ok) {
        setError(res.message);
      }
    });
  };

  const handleConfirmTeam = () => {
    if (!game) {
      setError("Game not found.");
      return;
    }

    setError("");
    socket.emit(
      "game:propose_team",
      { roomId: game.code, teamPlayerIds: game.selectedTeamPlayerIds },
      (res: GameActionResponse) => {
        if (!res.ok) {
          setError(res.message);
        }
      }
    );
  };

  const handleSubmitVote = (vote: "approve" | "reject") => {
    if (!game) {
      setError("Game not found.");
      return;
    }

    setError("");
    socket.emit("game:vote", { roomId: game.code, vote }, (res: GameActionResponse) => {
      if (!res.ok) {
        setError(res.message);
      }
    });
  };

  const handleSubmitMissionAction = (action: "success" | "fail") => {
    if (!game) {
      setError("Game not found.");
      return;
    }

    setError("");
    socket.emit("game:quest_action", { roomId: game.code, action }, (res: GameActionResponse) => {
      if (!res.ok) {
        setError(res.message);
      }
    });
  };

  const handleConfirmLadyTest = () => {
    if (!game || !game.ladyTargetPlayerId) {
      setError("No target selected.");
      return;
    }

    setError("");
    socket.emit(
      "game:lady_test",
      { roomId: game.code, targetPlayerId: game.ladyTargetPlayerId },
      (res: GameActionResponse) => {
        if (!res.ok) {
          setError(res.message);
        }
      }
    );
  };

  const handleConfirmAssassination = () => {
    if (!game || !game.assassinationTargetPlayerId) {
      setError("No target selected.");
      return;
    }

    setError("");
    socket.emit(
      "game:assassinate",
      { roomId: game.code, targetPlayerId: game.assassinationTargetPlayerId },
      (res: GameActionResponse) => {
        if (!res.ok) {
          setError(res.message);
        }
      }
    );
  };

  const handleDismissQuestResult = () => {
    setError("");
  };

  const handleAssignPlayerMark = (playerId: string, markId: string) => {
    if (!game) {
      return;
    }

    setPlayerMarksByGame((current) => ({
      ...current,
      [game.id]: {
        ...(current[game.id] ?? {}),
        [playerId]: markId,
      },
    }));
  };

  const handleClearPlayerMark = (playerId: string) => {
    if (!game) {
      return;
    }

    setPlayerMarksByGame((current) => {
      const nextAssignments = { ...(current[game.id] ?? {}) };
      delete nextAssignments[playerId];

      return {
        ...current,
        [game.id]: nextAssignments,
      };
    });
  };

  const handleReturnToRoom = () => {
    setError("");
    setGame(null);
  };

  if (game?.phase === "gameOver" && myPlayerId) {
    return (
      <GameOverPage
        room={game}
        error={error}
        onReturnToRoom={handleReturnToRoom}
      />
    );
  }

  if (page === "game" && game && myPlayerId) {
    return (
      <GameBoardPage
        room={game}
        myPlayerId={myPlayerId}
        error={error}
        requiredTeamSize={getRequiredTeamSize(game.players.length, game.questRound)}
        onSeatClick={handleBoardSeatClick}
        onStartBuildingTeam={handleStartBuildingTeam}
        onConfirmTeam={handleConfirmTeam}
        onConfirmLadyTest={handleConfirmLadyTest}
        onConfirmAssassination={handleConfirmAssassination}
        onSubmitVote={handleSubmitVote}
        onSubmitMissionAction={handleSubmitMissionAction}
        onDismissQuestResult={handleDismissQuestResult}
        playerMarkAssignments={playerMarksByGame[game.id] ?? {}}
        onAssignPlayerMark={handleAssignPlayerMark}
        onClearPlayerMark={handleClearPlayerMark}
      />
    );
  }

  if (page === "room" && room && myPlayerId) {
    return (
      <GameRoomPage
        room={room}
        myPlayerId={myPlayerId}
        error={error}
        onLeaveRoom={handleLeaveRoom}
        onStartGame={handleStartGame}
        onAddBot={handleAddBot}
        onFillAllSeatsWithBots={handleFillAllSeatsWithBots}
      />
    );
  }

  return (
    <HomePage
      playerName={playerName}
      joinRoomId={joinRoomId}
      room={room}
      myPlayerId={myPlayerId}
      error={error}
      onPlayerNameChange={setPlayerName}
      onJoinRoomIdChange={setJoinRoomId}
      onCreateRoom={handleCreate}
      onJoinRoom={handleJoin}
    />
  );
}

export default App;
