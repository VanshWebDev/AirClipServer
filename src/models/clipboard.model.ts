import { randomBytes } from "node:crypto";
import { dbQuery } from "../config/db.js";

interface ClipboardInput {
  content: string;
  room: string;
  senderId: string;
  senderUsername: string;
  senderDeviceInfo: string;
}

interface ClipboardRow {
  id: string;
  content: string;
  room: string;
  sender_id: string;
  sender_username: string;
  sender_device_info: string;
  created_at: Date;
  updated_at: Date;
}

const mapClipboard = (row: ClipboardRow) => ({
  _id: String(row.id).trim(),
  id: String(row.id).trim(),
  content: row.content,
  room: row.room,
  senderId: row.sender_id,
  senderUsername: row.sender_username,
  senderDeviceInfo: row.sender_device_info,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

class ClipboardQuery implements PromiseLike<ReturnType<typeof mapClipboard>[]> {
  private maxRows = 50;
  private order = "created_at DESC";

  constructor(private readonly room: string) {}

  sort(sortBy: { createdAt?: number }): this {
    this.order = sortBy.createdAt === 1 ? "created_at ASC" : "created_at DESC";
    return this;
  }

  limit(count: number): this {
    this.maxRows = Math.max(1, Math.min(500, Math.trunc(count)));
    return this;
  }

  private async execute(): Promise<ReturnType<typeof mapClipboard>[]> {
    const result = await dbQuery(
      "SELECT id, content, room, sender_id, sender_username, sender_device_info, created_at, updated_at " +
      "FROM clipboard_items WHERE room = $1 ORDER BY " + this.order + " LIMIT $2",
      [this.room, this.maxRows],
    );
    return (result.rows as ClipboardRow[]).map(mapClipboard);
  }

  then<TResult1 = ReturnType<typeof mapClipboard>[], TResult2 = never>(
    onfulfilled?: ((value: ReturnType<typeof mapClipboard>[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export class ClipboardItem {
  _id = "";
  id = "";
  content: string;
  room: string;
  senderId: string;
  senderUsername: string;
  senderDeviceInfo: string;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(data: ClipboardInput) {
    this.content = data.content;
    this.room = data.room;
    this.senderId = data.senderId;
    this.senderUsername = data.senderUsername;
    this.senderDeviceInfo = data.senderDeviceInfo;
  }

  async save(): Promise<this> {
    const id = randomBytes(12).toString("hex");
    const result = await dbQuery(
      "INSERT INTO clipboard_items (id, content, room, sender_id, sender_username, sender_device_info) " +
      "VALUES ($1, $2, $3, $4, $5, $6) " +
      "RETURNING id, content, room, sender_id, sender_username, sender_device_info, created_at, updated_at",
      [id, this.content, this.room, this.senderId, this.senderUsername, this.senderDeviceInfo],
    );
    const row = result.rows[0] as ClipboardRow;
    Object.assign(this, mapClipboard(row));
    return this;
  }

  static find(filter: { room: string }): ClipboardQuery {
    return new ClipboardQuery(filter.room);
  }
}

export default ClipboardItem;
