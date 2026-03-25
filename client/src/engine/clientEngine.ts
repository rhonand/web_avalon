import { socket } from "../socket/socket";

const handleCreate = () => {
    console.log("Create clicked", { playerName, connected: socket.connected });
    setError("");

    socket.emit("room:create", { playerName }, (res: CreateRoomResponse) => {
      console.log("room:create ack:", res);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setRoom(res.room);
      setMyPlayerId(res.playerId);
    });
  };