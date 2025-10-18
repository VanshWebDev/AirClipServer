import mongoose from "mongoose";

const pwdVerifySchema = new mongoose.Schema(
  {
    sub: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: "10m" },
    }, // Expires in 2 minutes
  },
  { timestamps: true }
);

export const PwdVerify = mongoose.model("PwdVerify", pwdVerifySchema);
