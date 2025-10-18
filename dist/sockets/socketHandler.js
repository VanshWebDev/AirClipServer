import { Server, Socket } from "socket.io";
export const initializeSocketIO = (io) => {
    io.on("connection", (socket) => {
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
//# sourceMappingURL=socketHandler.js.map