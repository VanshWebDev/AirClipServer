import { type Response } from "express";
import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import { AirClipErr } from "../error/AirClipErr.js";
import { OTP } from "../../models/otp.model.js";
import { sendRes } from "./reusableFunc.js";
import { resIfEmailSent } from "../../helpers/authController/sendOpt/resObj.js";

export const generateOtp = (): number => randomInt(100000, 1_000_000);

export const sendEmail = async (
  _res: Response,
  email: string,
  otp: number,
  key: string,
): Promise<boolean> => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) {
    throw new AirClipErr({
      status: 500,
      message: "SMTP credentials are not configured on the server",
      forFrontend: false,
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
  });

  const subject = key === "Email verification"
    ? "email verification"
    : key === "forgetpassword"
      ? "password reset"
      : "account verification";

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: email,
    subject: "AirClip " + subject + " OTP",
    text: "Your OTP for " + subject + " is " + otp + ". It expires in 10 minutes.",
  });

  if (info.accepted.length > 0) return true;
  throw new AirClipErr({
    status: 400,
    message: "Could not send OTP",
    forFrontend: true,
  });
};

export const saveOtp = async (email: string, otp: number) => {
  try {
    await OTP.create({ email, otp });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505" || code === "11000") {
      throw new AirClipErr({
        status: 400,
        message: "OTP already sent",
        forFrontend: true,
      });
    }
    throw error;
  }
};

export const sendResponse = (_res: Response) => {
  sendRes(_res, resIfEmailSent);
};
