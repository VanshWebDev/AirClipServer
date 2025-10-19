import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
// This map will store which user ID belongs to which socket ID
// e.g., { 'userId123': 'socketIdABC', 'userId456': 'socketIdXYZ' }
const socketToCustomRoom = new Map();
export const initializeSocketIO = (io) => {
    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);
        // A. When a user connects and registers, they automatically join their private room
        socket.on("register_user", ({ userId }) => {
            // Every user joins a room named after their own userId
            socket.join(userId);
            console.log(`Socket ${socket.id} joined personal room: ${userId}`);
        });
        // B. Listen for a user wanting to join a custom, shared room
        socket.on("join_room", (roomName) => {
            // Leave the previous custom room, if any
            const previousRoom = socketToCustomRoom.get(socket.id);
            if (previousRoom) {
                socket.leave(previousRoom);
                console.log(`Socket ${socket.id} left room: ${previousRoom}`);
            }
            // Join the new custom room
            socket.join(roomName);
            socketToCustomRoom.set(socket.id, roomName);
            console.log(`Socket ${socket.id} joined custom room: ${roomName}`);
        });
        // --- THIS IS THE CORRECTED PART ---
        // C. Handle incoming clipboard items for a specific room
        socket.on("send_clipboard_item", (item) => {
            const { content, room } = item;
            console.log(`Received item for room '${room}':`, content);
            const messagePayload = {
                id: new mongoose.Types.ObjectId().toString(),
                content: content,
                senderId: socket.id, // We can enhance this to send userId later
            };
            // Broadcast the message ONLY to clients in that specific room
            // The frontend listens for 'receive_clipboard_item'
            io.to(room).emit("receive_clipboard_item", messagePayload);
        });
        // D. Clean up when a user disconnects
        socket.on("disconnect", () => {
            socketToCustomRoom.delete(socket.id); // Clean up the room map
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
};
//# sourceMappingURL=socketHandler.js.map