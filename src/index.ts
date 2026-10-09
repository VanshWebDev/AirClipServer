import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { initializeSocketIO } from "./sockets/socketHandler.js";
import { setRealtimeServer } from "./services/realtime.service.js";
import { initializeIotMqtt } from "./services/iotMqtt.service.js";
import { corsOptions } from "./constant/optionObj/optionObj.js";
import authRoutes from "./routes/auth.route.js";
import socketRoutes from "./routes/socket.route.js";
import iotRoutes from "./routes/iot.route.js";
import { errHandlerMiddleware } from "./middleware/errHandler.middleware.js";

const app = express();
const server = createServer(app);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || ""));
app.use(limiter);

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

initializeSocketIO(io);
setRealtimeServer(io);
initializeIotMqtt(io);

const port = Number(process.env.PORT) || 4000;

app.use("/api/auth", authRoutes);
app.use("/api/socket", socketRoutes);
app.use("/api/iot", iotRoutes);

app.get("/api/health", async (_req, res) => {
  res.status(200).json({
    status: "ok",
    database: "postgresql",
    iotMode: process.env.IOT_MODE === "mqtt" ? "mqtt" : "simulator",
  });
});

app.use(errHandlerMiddleware);

const startServer = async () => {
  await connectDB();
  server.listen(port, () => {
    console.log("AirClip server started");
    console.log("Server listening on port " + port);
  });
};

void startServer().catch((error: unknown) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
