import { Server, Socket } from "socket.io";
import { ClipboardItem } from "../models/clipboard.model.js";

// Connected user metadata is kept in memory for the current Socket.IO process.
const socketToUser = new Map<string, { userId: string; username: string; senderDeviceInfo: string }>();

export const initializeSocketIO = (io: Server) => {
  const getUsersInRoom = (roomName: string) => {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) return [];

    return Array.from(room)
      .map((socketId) => socketToUser.get(socketId))
      .filter((user) => user !== undefined);
  };

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register_user", ({ userId, username, senderDeviceInfo }) => {
      // User identity is validated by the HTTP auth flow before this client is used.
      socketToUser.set(socket.id, { userId, username, senderDeviceInfo });
      socket.join(userId);
      console.log("Socket registered:", username);
    });

    socket.on("join_room", (roomName: string) => {
      if (typeof roomName !== "string" || roomName.length < 1 || roomName.length > 120) return;

      const previousRoom = Array.from(socket.rooms).find(
        (room) => room !== socket.id && !/^[a-f0-9]{24}$/i.test(room),
      );
      if (previousRoom && previousRoom !== roomName) {
        socket.leave(previousRoom);
        io.to(previousRoom).emit("update_room_users", getUsersInRoom(previousRoom));
      }

      socket.join(roomName);
      io.to(roomName).emit("update_room_users", getUsersInRoom(roomName));
    });

    socket.on("send_clipboard_item", async (item: { content: string; room: string }) => {
      const sender = socketToUser.get(socket.id);
      if (!sender || !item || typeof item.content !== "string" ||
          typeof item.room !== "string" || item.content.length > 100_000 ||
          item.room.length < 1 || item.room.length > 120) {
        return;
      }

      try {
        const newItem = new ClipboardItem({
          content: item.content,
          room: item.room,
          senderId: sender.userId,
          senderUsername: sender.username,
          senderDeviceInfo: sender.senderDeviceInfo,
        });
        await newItem.save();

        io.to(item.room).emit("receive_clipboard_item", {
          id: newItem._id,
          _id: newItem._id,
          content: newItem.content,
          senderId: socket.id,
          senderUsername: sender.username || "Anonymous",
          senderDeviceInfo: sender.senderDeviceInfo,
          createdAt: newItem.createdAt,
        });
      } catch (error) {
        console.error("Could not persist clipboard item:", error);
        socket.emit("clipboard_error", { message: "Clipboard item could not be saved." });
      }
    });

    socket.on("iot:subscribe", (deviceId: unknown) => {
      if (typeof deviceId !== "string" || !/^TBLS[0-9]{5}$/.test(deviceId)) return;
      socket.join("iot:" + deviceId);
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const userId = socketToUser.get(socket.id)?.userId;
          const usersInRoom = getUsersInRoom(room).filter((user) => user.userId !== userId);
          socket.to(room).emit("update_room_users", usersInRoom);
        }
      }
    });

    socket.on("disconnect", () => {
      socketToUser.delete(socket.id);
      console.log("Socket disconnected:", socket.id);
    });
  });
};
