import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { decryptJwt } from "../utils/token/crypt.utils.js";
import {
  createLedCommand,
  isValidDeviceId,
  listCommands,
  listDeviceEvents,
  listDevices,
} from "../services/iot.service.js";
import { getRealtimeServer } from "../services/realtime.service.js";

const cryptoSecret = process.env.CRYPTO_SECRET || "";

const getRequesterId = (req: Request): string | null => {
  const signedToken = req.signedCookies?.token;
  if (!signedToken) return null;

  try {
    const payload = decryptJwt(signedToken, cryptoSecret) as JwtPayload;
    return typeof payload._id === "string" ? payload._id : null;
  } catch {
    return null;
  }
};

const parseLimit = (value: unknown, fallback: number, maximum: number): number => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : fallback;
  return Number.isFinite(parsed) ? Math.max(1, Math.min(maximum, parsed)) : fallback;
};

export const getIotDevices = async (_req: Request, res: Response) => {
  res.status(200).json({ devices: await listDevices(), mode: process.env.IOT_MODE === "mqtt" ? "mqtt" : "simulator" });
};

export const getIotCommands = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId ?? "";
  if (!isValidDeviceId(deviceId)) return res.status(400).json({ message: "Invalid device ID" });
  const commands = await listCommands(deviceId, parseLimit(req.query.limit, 50, 200));
  res.status(200).json({ commands });
};

export const getIotEvents = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId ?? "";
  if (!isValidDeviceId(deviceId)) return res.status(400).json({ message: "Invalid device ID" });
  const events = await listDeviceEvents(deviceId, parseLimit(req.query.limit, 100, 500));
  res.status(200).json({ events });
};

export const postIotCommand = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId ?? "";
  const command = req.body?.command;
  if (command !== "LED_ON" && command !== "LED_OFF") {
    return res.status(400).json({ message: "command must be LED_ON or LED_OFF" });
  }

  const io = getRealtimeServer();
  if (!io) return res.status(503).json({ message: "Realtime server is not initialized" });

  const result = await createLedCommand(deviceId, command, getRequesterId(req), io);
  return res.status(202).json({ command: result });
};
