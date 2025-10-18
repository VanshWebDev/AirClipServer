import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { initializeSocketIO } from "./sockets/socketHandler.js";
import cors from "cors";
import { corsOptions } from "./constant/optionObj/optionObj.js";
import authRoute from "./routes/auth.route.js";
import { errHandlerMiddleware } from "./middleware/errHandler.middleware.js";
import cookieParser from "cookie-parser";
dotenv.config();

// Environment variable
const cookieSecret = process.env.COOKIE_SECRET;

const app = express();
const server = createServer(app);

// Connect to Database
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // For parsing JSON bodies
app.use(cookieParser(cookieSecret));
//Initialize Socket.IO
const io = new Server(server, { cors: corsOptions });
initializeSocketIO(io); // Pass the 'io' instance to the handler

const port = Number(process.env.PORT) || 4000;

//routes
app.use("/api/auth", authRoute);

// Error Handling Middleware
app.use(errHandlerMiddleware);

server.listen(port, () => {
  console.log("Welcome to AirClip ☘️");
  console.log(`Server listening on port ${port}`);
});
