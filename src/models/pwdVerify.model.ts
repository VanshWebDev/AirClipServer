import { dbQuery } from "../config/db.js";

export const PwdVerify = {
  findOne: async ({ email }: { email: string }) => {
    const result = await dbQuery(
      "SELECT email, sub, name, picture FROM pwd_verifications WHERE LOWER(email) = LOWER($1) AND expires_at > NOW() LIMIT 1",
      [email],
    );
    const row = result.rows[0] as {
      email: string;
      sub: string | null;
      name: string | null;
      picture: string | null;
    } | undefined;

    if (!row) return null;
    return {
      ...row,
      updateOne: async (update: { email?: string; sub?: string; name?: string; picture?: string }) => {
        await dbQuery(
          "UPDATE pwd_verifications SET sub = $1, name = $2, picture = $3, updated_at = NOW(), expires_at = NOW() + INTERVAL '10 minutes' WHERE LOWER(email) = LOWER($4)",
          [update.sub ?? row.sub, update.name ?? row.name, update.picture ?? row.picture, email],
        );
      },
    };
  },

  upsert: async (data: { email: string; sub?: string; name?: string; picture?: string }) => {
    await dbQuery(
      "INSERT INTO pwd_verifications (email, sub, name, picture, expires_at) VALUES (LOWER($1), $2, $3, $4, NOW() + INTERVAL '10 minutes') " +
      "ON CONFLICT (email) DO UPDATE SET sub = EXCLUDED.sub, name = EXCLUDED.name, picture = EXCLUDED.picture, expires_at = EXCLUDED.expires_at, updated_at = NOW()",
      [data.email, data.sub ?? null, data.name ?? null, data.picture ?? null],
    );
  },
};

export default PwdVerify;
