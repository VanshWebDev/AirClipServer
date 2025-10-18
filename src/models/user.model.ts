import mongoose from "mongoose";
import { ifTheUserRequestingOtpAlreadyExist } from "../helpers/authController/sendOpt/errObj.js";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  name: {
    type: String,
  },
  profilePicture: {
    type: String,
    default:
      "https://res.cloudinary.com/deafpiqn6/image/upload/v1724751005/byzbqw8xikw26c2fflta.png",
  },
});

export const User = mongoose.model("User", UserSchema);
