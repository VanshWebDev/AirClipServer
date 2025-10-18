import mongoose from "mongoose";


const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: "10m" },
    }, // Expires in 10 minutes
  },
  { timestamps: true }
);

export const OTP = mongoose.model("OTP", otpSchema);