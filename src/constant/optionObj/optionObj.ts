import { type CorsOptions } from "cors";
import dotenv from "dotenv";
import { type CookieOptions } from "express";
dotenv.config();
const frontendUrl = process.env.FRONTEND_URL || "https://airclip.netlify.app";
const frontendUrlForDevelopment =
  process.env.FRONTEND_URL_FOR_DEVELOPMENT || "";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: [frontendUrl, frontendUrlForDevelopment,"http://192.168.43.139:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

export const socketIoOptions = {
  origin:[ frontendUrl, "http://192.168.43.139:5173"],
  methods: ["GET", "POST"],
  credentials: true,
};

export const expressSessionOptions = {
  secret: process.env.EXPRESS_SESSION_SECRET || "",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 2 * 60 * 1000,
  },
};

export const createCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  signed: true,
  sameSite: "none" as "none",
};

export const createCookieOptionsForAdmin: CookieOptions = {
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days
  signed: true,
  sameSite: "none" as "none",
};
