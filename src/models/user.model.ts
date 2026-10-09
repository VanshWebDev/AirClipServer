import { randomBytes } from "node:crypto";
import { dbQuery } from "../config/db.js";

interface UserFilter {
  email?: string;
  username?: string;
  affiname?: string;
}

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string | null;
  name: string | null;
  profile_picture: string | null;
}

export interface UserRecord {
  _id: string;
  email: string;
  username: string;
  password?: string;
  name?: string;
  profilePicture?: string;
  save: () => Promise<void>;
}

const toUser = (row: UserRow, includePassword = false): UserRecord => {
  const user: UserRecord = {
    _id: String(row.id).trim(),
    email: row.email,
    username: row.username,
    ...(row.name ? { name: row.name } : {}),
    ...(row.profile_picture ? { profilePicture: row.profile_picture } : {}),
    save: async () => {
      await dbQuery(
        "UPDATE users SET name = $1, profile_picture = $2, updated_at = NOW() WHERE id = $3",
        [user.name ?? null, user.profilePicture ?? null, user._id],
      );
    },
  };

  if (includePassword && row.password !== null) user.password = row.password;
  return user;
};

const findByFilter = async (
  filter: UserFilter,
  includePassword = false,
): Promise<UserRecord | null> => {
  let column: "email" | "username";
  let value: string;

  if (typeof filter.email === "string") {
    column = "email";
    value = filter.email;
  } else if (typeof filter.username === "string") {
    column = "username";
    value = filter.username;
  } else if (typeof filter.affiname === "string") {
    // Backwards compatibility with an old login field name.
    column = "username";
    value = filter.affiname;
  } else {
    return null;
  }

  const passwordSelect = includePassword ? ", password" : ", NULL::text AS password";
  const result = await dbQuery(
    "SELECT id, email, username" + passwordSelect +
      ", name, profile_picture FROM users WHERE LOWER(" + column + ") = LOWER($1) LIMIT 1",
    [value],
  );
  const row = result.rows[0] as UserRow | undefined;
  return row ? toUser(row, includePassword) : null;
};

export const User = {
  findOne: (filter: UserFilter) => findByFilter(filter),
  findOneWithPassword: (filter: UserFilter) => findByFilter(filter, true),

  findById: async (id: string): Promise<UserRecord | null> => {
    const result = await dbQuery(
      "SELECT id, email, username, NULL::text AS password, name, profile_picture FROM users WHERE id = $1 LIMIT 1",
      [id],
    );
    const row = result.rows[0] as UserRow | undefined;
    return row ? toUser(row) : null;
  },

  create: async (data: {
    email: string;
    username: string;
    password?: string;
    name?: string;
    profilePicture?: string;
    picture?: string;
  }): Promise<UserRecord> => {
    if (!data.username) throw new Error("A username is required");
    const id = randomBytes(12).toString("hex");
    const result = await dbQuery(
      "INSERT INTO users (id, email, username, password, name, profile_picture) " +
      "VALUES ($1, LOWER($2), LOWER($3), $4, $5, $6) " +
      "RETURNING id, email, username, password, name, profile_picture",
      [
        id,
        data.email,
        data.username,
        data.password ?? null,
        data.name ?? null,
        data.profilePicture ?? data.picture ?? null,
      ],
    );
    return toUser(result.rows[0] as UserRow, false);
  },

  findOneAndUpdate: async (
    filter: UserFilter,
    update: { $set?: Record<string, unknown>; password?: string; name?: string },
  ): Promise<UserRecord | null> => {
    const values = update.$set ?? update;
    const email = filter.email;
    if (!email) return null;

    const setParts: string[] = [];
    const params: unknown[] = [];
    if (typeof values.password === "string") {
      params.push(values.password);
      setParts.push("password = $" + params.length);
    }
    if (typeof values.name === "string") {
      params.push(values.name);
      setParts.push("name = $" + params.length);
    }
    if (setParts.length === 0) return findByFilter(filter);

    params.push(email.toLowerCase());
    const result = await dbQuery(
      "UPDATE users SET " + setParts.join(", ") + ", updated_at = NOW() " +
      "WHERE LOWER(email) = $" + params.length +
      " RETURNING id, email, username, NULL::text AS password, name, profile_picture",
      params,
    );
    const row = result.rows[0] as UserRow | undefined;
    return row ? toUser(row) : null;
  },

  updateOne: async (
    filter: UserFilter,
    update: { password?: string; $set?: Record<string, unknown> },
  ): Promise<{ modifiedCount: number }> => {
    const values = update.$set ?? update;
    if (!filter.email || typeof values.password !== "string") {
      return { modifiedCount: 0 };
    }
    const result = await dbQuery(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2)",
      [values.password, filter.email],
    );
    return { modifiedCount: result.rowCount ?? 0 };
  },
};

export default User;
