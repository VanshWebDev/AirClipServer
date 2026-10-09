import { dbQuery } from "../config/db.js";

interface OtpRecord {
  email: string;
  otp: number;
  expires_at: Date;
}

export const OTP = {
  findOne: async ({ email }: { email: string }): Promise<{ email: string; otp: number } | null> => {
    const result = await dbQuery(
      "SELECT email, otp, expires_at FROM password_reset_otps WHERE LOWER(email) = LOWER($1) AND expires_at > NOW() LIMIT 1",
      [email],
    );
    const row = result.rows[0] as OtpRecord | undefined;
    return row ? { email: row.email, otp: Number(row.otp) } : null;
  },

  create: async ({ email, otp }: { email: string; otp: number }) => {
    await dbQuery("DELETE FROM password_reset_otps WHERE expires_at <= NOW()");
    const result = await dbQuery(
      "INSERT INTO password_reset_otps (email, otp, expires_at) VALUES (LOWER($1), $2, NOW() + INTERVAL '10 minutes') RETURNING email, otp",
      [email, otp],
    );
    return result.rows[0];
  },

  deleteOne: async ({ email }: { email: string }) => {
    const result = await dbQuery(
      "DELETE FROM password_reset_otps WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    return { deletedCount: result.rowCount ?? 0 };
  },
};

export default OTP;
