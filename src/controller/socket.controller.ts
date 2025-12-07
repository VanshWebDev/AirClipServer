import type { Request as Rq, Response as Rs } from "express";
import { ClipboardItem } from "../models/clipboard.model.js";

export const getClipboardHistory = async (req: Rq, res: Rs) => {
  const { roomName } = req.params;
  console.log('first')

  // Fetch the last 50 items for the given room, sorted by most recent
  const history = await ClipboardItem.find({ room: roomName })
    .sort({ createdAt: -1 })
    .limit(50);

  // We reverse it so the oldest messages are first, for chronological order in UI
  res.status(200).json(history);
};
