import "dotenv/config";
import { MongoClient } from "mongodb";
import pg from "pg";

const { Pool } = pg;
const pgPool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || "tbls_iot",
        user: process.env.PGUSER || "postgres",
        ...(process.env.PGPASSWORD ? { password: process.env.PGPASSWORD } : {}),
        ...(process.env.PGSSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
      },
);

const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  throw new Error("Set MONGODB_URL temporarily to import existing AirClip data.");
}

const mongo = new MongoClient(mongoUrl);

const objectIdString = (value) => {
  const id = value?.toString?.() ?? String(value ?? "");
  return /^[a-f0-9]{24}$/i.test(id) ? id.toLowerCase() : null;
};

const importUsers = async (db) => {
  const rows = await db.collection("users").find({}).toArray();
  let imported = 0;
  for (const row of rows) {
    const id = objectIdString(row._id);
    if (!id || !row.email || !row.username) {
      console.warn("Skipping a user record with missing/invalid ID, email or username.");
      continue;
    }
    const result = await pgPool.query(
      "INSERT INTO users (id, email, username, password, name, profile_picture, created_at, updated_at) " +
        "VALUES ($1, LOWER($2), LOWER($3), $4, $5, $6, $7, $8) " +
        "ON CONFLICT (email) DO NOTHING",
      [
        id,
        row.email,
        row.username,
        row.password ?? null,
        row.name ?? null,
        row.profilePicture ?? row.picture ?? null,
        row.createdAt ?? new Date(),
        row.updatedAt ?? row.createdAt ?? new Date(),
      ],
    );
    imported += result.rowCount ?? 0;
  }
  console.log("Users imported:", imported, "/", rows.length);
};

const importClipboardItems = async (db) => {
  const rows = await db.collection("clipboarditems").find({}).toArray();
  let imported = 0;
  for (const row of rows) {
    const id = objectIdString(row._id);
    if (!id || !row.content || !row.room || !row.senderId || !row.senderUsername || !row.senderDeviceInfo) {
      continue;
    }
    const result = await pgPool.query(
      "INSERT INTO clipboard_items (id, content, room, sender_id, sender_username, sender_device_info, created_at, updated_at) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING",
      [
        id,
        row.content,
        row.room,
        row.senderId,
        row.senderUsername,
        row.senderDeviceInfo,
        row.createdAt ?? new Date(),
        row.updatedAt ?? row.createdAt ?? new Date(),
      ],
    );
    imported += result.rowCount ?? 0;
  }
  console.log("Clipboard records imported:", imported, "/", rows.length);
};

const importOtps = async (db, collectionName, tableName) => {
  const rows = await db.collection(collectionName).find({ expiresAt: { $gt: new Date() } }).toArray();
  let imported = 0;
  for (const row of rows) {
    if (!row.email || typeof row.otp !== "number") continue;
    const result = await pgPool.query(
      "INSERT INTO " + tableName + " (email, otp, expires_at, created_at) VALUES (LOWER($1), $2, $3, $4) " +
        "ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at",
      [row.email, row.otp, row.expiresAt, row.createdAt ?? new Date()],
    );
    imported += result.rowCount ?? 0;
  }
  console.log(collectionName + " imported:", imported, "/", rows.length);
};

const importPwdVerifications = async (db) => {
  const rows = await db.collection("pwdverifies").find({ expiresAt: { $gt: new Date() } }).toArray();
  let imported = 0;
  for (const row of rows) {
    if (!row.email) continue;
    const result = await pgPool.query(
      "INSERT INTO pwd_verifications (email, sub, name, picture, expires_at, created_at, updated_at) " +
        "VALUES (LOWER($1), $2, $3, $4, $5, $6, $7) " +
        "ON CONFLICT (email) DO NOTHING",
      [
        row.email,
        row.sub ?? null,
        row.name ?? null,
        row.picture ?? null,
        row.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
        row.createdAt ?? new Date(),
        row.updatedAt ?? row.createdAt ?? new Date(),
      ],
    );
    imported += result.rowCount ?? 0;
  }
  console.log("Pending verification records imported:", imported, "/", rows.length);
};

try {
  await mongo.connect();
  const db = mongo.db();
  await pgPool.query("SELECT 1");
  await importUsers(db);
  await importClipboardItems(db);
  await importOtps(db, "otps", "password_reset_otps");
  await importOtps(db, "verifyemailotps", "email_verification_otps");
  await importPwdVerifications(db);
  console.log("Import finished. Review the counts before switching production traffic.");
} catch (error) {
  console.error("MongoDB to PostgreSQL import failed:", error);
  process.exitCode = 1;
} finally {
  await mongo.close();
  await pgPool.end();
}
