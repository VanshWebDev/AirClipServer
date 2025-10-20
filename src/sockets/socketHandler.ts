import mongoose from "mongoose";
import { Server, Socket } from "socket.io";

// New Map: Stores user details for each socket ID
// e.g., { 'socketIdABC': { userId: '123', username: 'Vansh' } }
const socketToUser = new Map<string, { userId: string, username: string }>();

export const initializeSocketIO = (io: Server) => {
  // Helper function to get a list of user details for a given room
  const getUsersInRoom = (roomName: string) => {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) return [];

    return Array.from(room)
      .map(socketId => socketToUser.get(socketId))
      .filter(user => user !== undefined); // Filter out any undefined users
  };

  io.on("connection", (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // A. When a user registers, store their details and join their personal room
    socket.on("register_user", ({ userId, username }) => {
      socketToUser.set(socket.id, { userId, username });
      socket.join(userId);
      console.log(`Socket ${socket.id} (${username}) joined personal room: ${userId}`);
    });

    // B. When a user joins a custom room
    socket.on("join_room", (roomName: string) => {
      // Find and leave the previous custom room
      console.log("Socket rooms: ",Array.from(socket.rooms))
      Array.from(socket.rooms).find((room) => {
        console.log("room: ",room)
        console.log("socket.id: ", socket.id)
        room !== socket.id && !mongoose.Types.ObjectId.isValid(room)
      });
      const previousRoom = Array.from(socket.rooms).find(room => room !== socket.id && !mongoose.Types.ObjectId.isValid(room));
      console.log("previous room: " ,previousRoom)
      if (previousRoom) {
        socket.leave(previousRoom);
        console.log(`Socket ${socket.id} left room: ${previousRoom}`);
        // Notify the old room that a user has left
        io.to(previousRoom).emit('update_room_users', getUsersInRoom(previousRoom));
      }

      // Join the new room
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined custom room: ${roomName}`);
      // Notify the new room with the updated list of users
      io.to(roomName).emit('update_room_users', getUsersInRoom(roomName));
    });

    // C. Handle sending clipboard items
    socket.on("send_clipboard_item", (item: { content: string; room: string }) => {
      const { content, room } = item;
      const sender = socketToUser.get(socket.id);

      const messagePayload = {
        id: new mongoose.Types.ObjectId().toString(),
        content: content,
        senderId: socket.id,
        senderUsername: sender?.username || 'Anonymous', // Include username
      };
      
      io.to(room).emit("receive_clipboard_item", messagePayload);
    });

    // D. When a user disconnects, notify all relevant rooms
    socket.on("disconnecting", () => {
      // For each room the socket was in...
      socket.rooms.forEach(room => {
        // ...if it's not the socket's private ID room...
        if (room !== socket.id) {
          // ...get the list of users *after* this socket is removed...
          const usersInRoom = getUsersInRoom(room).filter(user => user.userId !== socketToUser.get(socket.id)?.userId);
          // ...and broadcast the new list to that room.
          socket.to(room).emit('update_room_users', usersInRoom);
        }
      });
    });
    
    socket.on("disconnect", () => {
      socketToUser.delete(socket.id); // Clean up the user map
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

