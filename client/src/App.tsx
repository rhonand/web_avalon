
import HomePage from "./pages/HomePage";

function App() {
  return <HomePage />;
  //return <div>hello</div>;
}

export default App;




/*

// Legacy Local Game


import { useState } from "react";
import type { Page, VoteChoice, QuestAction, Room } from "./types/gameTypes";
import { createInitialRoom } from "./data/mockRoom";
import {
  leaveRoom,
  startGame,
  togglePlayerSelection,
  startBuildingTeam,
  confirmTeamSelection,
  submitVote,
  submitQuestAction,
  getRequiredTeamSize,
  advanceAfterQuestResult,
  addBot,
  fillAllSeatsWithBots
} from "./engine/gameEngine";
import { useGameAutomation } from "./engine/useGameAutomation";

import HomePage from "./pages/HomePage";
import GameRoomPage from "./pages/GameRoomPage";
import GameBoardPage from "./pages/GameBoardPage";
import GameOverPage from "./pages/GameOverPage";

function App() {
  const [page, setPage] = useState<Page>("home");
  const [room, setRoom] = useState<Room>(() => createInitialRoom());

  const myPlayerId = "me";

  useGameAutomation(room, setRoom, myPlayerId);

  function handleLeaveRoom(playerId: string) {
    setRoom((prev) => leaveRoom(prev, playerId));

    if (playerId === myPlayerId) {
      setPage("home");
    }
  }

  function handleStartGame() {
    setRoom((prev) => startGame(prev));
    setPage("game");
  }

  function handleToggleTeamMember(playerId: string) {
    console.log("App handleSeatClick -> togglePlayerSelection", playerId);
    setRoom((prev) => togglePlayerSelection(prev, playerId));
  }

  function handleStartBuildingTeam() {
    setRoom((prev) => startBuildingTeam(prev));
  }

  function handleConfirmTeam() {
    setRoom((prev) => confirmTeamSelection(prev));
  }

  function handleSubmitVote(vote: VoteChoice) {
    setRoom((prev) => submitVote(prev, myPlayerId, vote));
  }

  function handleSubmitQuestAction(action: QuestAction) {
    setRoom((prev) => submitQuestAction(prev, myPlayerId, action));
  }

  function handleDismissQuestResult() {
    setRoom((prev) => advanceAfterQuestResult(prev));
  }


  function handleAddBot() {
    setRoom((prev) => addBot(prev));
  }


  function handleFillAllSeatsWithBots() {
    setRoom((prev) => fillAllSeatsWithBots(prev));
  }

  const requiredTeamSize = getRequiredTeamSize(
    room.players.length,
    room.questRound
  );

  if (page === "home") {
    return (
      <HomePage
        onCreateRoom={() => {
          setRoom(createInitialRoom());
          setPage("room");
        }}
        onJoinRoom={() => {
          setRoom(createInitialRoom());
          setPage("room");
        }}
      />
    );
  }

  if (page === "room") {
    return (
      <GameRoomPage
        room={room}
        myPlayerId={myPlayerId}
        onLeaveRoom={handleLeaveRoom}
        onStartGame={handleStartGame}
        onAddBot={handleAddBot}
        onFillAllSeatsWithBots={handleFillAllSeatsWithBots}
      />
    );
  }

  if (room.phase === "gameOver") {
    return (
      <GameOverPage
        room={room}
        onRestart={() => {
          setRoom(createInitialRoom());
          setPage("home");
        }}
      />
    );
  }

  return (
    <GameBoardPage
      room={room}
      myPlayerId={myPlayerId}
      requiredTeamSize={requiredTeamSize}
      onSeatClick={handleToggleTeamMember}
      onStartBuildingTeam={handleStartBuildingTeam}
      onConfirmTeam={handleConfirmTeam}
      onSubmitVote={handleSubmitVote}
      onSubmitMissionAction={handleSubmitQuestAction}
      onDismissQuestResult={handleDismissQuestResult}
    />
  );
}

export default App;

*/