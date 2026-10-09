import cookieParser from "cookie-parser";
import type { JwtPayload } from "jsonwebtoken";
import type { Socket } from "socket.io";
import { User } from "../models/user.model.js";
import { decryptJwt } from "../utils/token/crypt.utils.js";

const cookieSecret = process.env.COOKIE_SECRET || "";
const cryptoSecret = process.env.CRYPTO_SECRET || "";

export const authenticateSocket = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  try {
    const header = socket.handshake.headers.cookie || "";
    const rawToken = header
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("token="))
      ?.slice("token=".length);

    if (!rawToken || !cookieSecret || !cryptoSecret) {
      return next(new Error("Unauthorized Socket.IO connection"));
    }

    const decodedCookie = decodeURIComponent(rawToken);
    const encryptedToken = cookieParser.signedCookie(decodedCookie, cookieSecret);
    if (!encryptedToken || typeof encryptedToken !== "string") {
      return next(new Error("Invalid signed login cookie"));
    }

    const payload = decryptJwt(encryptedToken, cryptoSecret) as JwtPayload;
    if (typeof payload !== "object" || typeof payload._id !== "string") {
      return next(new Error("Invalid login token"));
    }

    const user = await User.findById(payload._id);
    if (!user) return next(new Error("User session is no longer valid"));

    socket.data.userId = user._id;
    socket.data.username = user.username;
    next();
  } catch {
    next(new Error("Unauthorized Socket.IO connection"));
  }
};
