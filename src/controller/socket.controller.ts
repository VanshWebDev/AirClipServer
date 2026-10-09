import type { Request as Rq, Response as Rs } from "express";
import { ClipboardItem } from "../models/clipboard.model.js";

export const getClipboardHistory = async (req: Rq, res: Rs) => {
  const roomName = req.params.roomName;
  if (!roomName || roomName.length > 120) {
    return res.status(400).json({ message: "Invalid room name" });
  }

  const history = await ClipboardItem.find({ room: roomName })
    .sort({ createdAt: -1 })
    .limit(50);

  // Show the items chronologically for the UI.
  return res.status(200).json(history);
};
