import "dotenv/config";
import { Pool, type PoolConfig } from "pg";

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    }
  : {
      host: process.env.PGHOST ?? "localhost",
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE ?? "tbls_iot",
      user: process.env.PGUSER ?? "postgres",
      ...(process.env.PGPASSWORD ? { password: process.env.PGPASSWORD } : {}),
      ...(process.env.PGSSL === "true"
        ? { ssl: { rejectUnauthorized: true } }
        : {}),
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    };

export const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error);
});

export const dbQuery = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) => pool.query<T>(text, values);

const connectDB = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("Connected to PostgreSQL successfully");
  } finally {
    client.release();
  }
};

export default connectDB;
