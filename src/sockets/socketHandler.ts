import { Server, Socket } from "socket.io";

export const initializeSocketIO = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A new user has connected ✅", socket.id);

    // Handle specific events for this user
    socket.on("send_message", (data) => {
      // Broadcast the message to all other clients
      socket.broadcast.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected ❌", socket.id);
    });
  });
};
