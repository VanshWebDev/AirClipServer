import { dbQuery } from "../../../config/db.js";

interface UserRow {
  id: string;
  email: string;
  username: string | null;
  profile_picture: string | null;
}

interface UserForResponse {
  _id: string;
  email: string;
  username?: string | null;
  profilePicture?: string | null;
}

export const resIfUserObj = (user: UserForResponse) => ({
  statusCode: 200,
  data: {
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
    },
    authenticated: true,
  },
});

export const getUser = async (id: string): Promise<UserForResponse | null> => {
  const result = await dbQuery(
    "SELECT id, email, username, profile_picture FROM users WHERE id = $1 LIMIT 1",
    [id],
  );
  const row = result.rows[0] as UserRow | undefined;
  if (!row) return null;
  return {
    _id: String(row.id).trim(),
    email: row.email,
    ...(row.username ? { username: row.username } : {}),
    ...(row.profile_picture ? { profilePicture: row.profile_picture } : {}),
  };
};
