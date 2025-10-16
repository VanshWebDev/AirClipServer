import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const port = Number(process.env.PORT) || 4000;

//socket.io
io.on("connection", (socket) => {
  console.log("a new user hase connected", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("message data:", data, "from", socket.id);
    // io.to(data.id).emit("receiveMsg", data);
    socket.emit("receiveMessage", data);
  });

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send(`app listening on port ${port}`);
});

server.listen(port, () => {
  console.log("Welcome to AirClip ☘️");
  console.log(`Server listening on port ${port}`);
});
