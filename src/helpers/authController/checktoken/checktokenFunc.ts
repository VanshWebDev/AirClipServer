import { Types } from "mongoose";
import { User } from "../../../models/user.model.js";
import type mongoose from "mongoose";

interface user {
  _id: Types.ObjectId;
  email: string;
  username?: string;
  profilePicture?: string | null;
}

export const resIfUserObj = (user: user) => {
  return {
    statusCode: 200,
    data: {
      user: {
        _id: user?._id.toString(),
        email: user?.email,
        username: user?.username,
        profilePicture: user?.profilePicture,
      },
      authenticated: true,
    },
  };
};

export const getUser = async (id: mongoose.Types.ObjectId) => {
  return await User.findById(id);
};

// export const getUserIfUsername = async (affiname: string) => {
//   return await User.findOne({ affiname });
// };