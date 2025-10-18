import { type Response } from "express";
import nodemailer from "nodemailer";
import { AirClipErr } from "../error/AirClipErr.js";
import { OTP } from "../../models/otp.model.js";
import { sendRes } from "./reusableFunc.js";
import { resIfEmailSent } from "../../helpers/authController/sendOpt/resObj.js";

export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp;
};

export const sendEmail = async (
  res: Response,
  email: string,
  otp: number,
  key: string
): Promise<boolean> => {
  // Create a transporter object with SMTP settings
  let transporter = nodemailer.createTransport({
    service: "Gmail", // Example: Gmail, you can use any email service provider
    auth: {
      user: "varsna.service@gmail.com", // Your email
      // pass: "qudr vvki akbb mrma", // Your email password
      pass: "xvyc teua csft mxai", // Your email password
    },
  });

  let subject = "";
  // Define the email
  if (key == "Email verification") subject = "email verification";
  else if (key == "forgetpassword") subject = "password reset";

  let mailOptions = {
    from: "vanshvanshkumar39@gmail.com",
    to: email,
    subject: `varsna ${subject} OTP`,
    text: `Your OTP for ${subject} is ${otp}`,
  };

  // Send the email
  let info = await transporter.sendMail(mailOptions);
  if (info.accepted.length > 0) return true;
  else
    throw new AirClipErr({
      status: 400,
      message: "couldn't send otp",
      forFrontend: true,
    });
};

export const saveOtp = async (email: string, otp: number) => {
  await OTP.create({ email, otp }).catch((err: any) => {
    if (err.code === 11000) {
      throw new AirClipErr({
        status: 400,
        message: "OTP already sent",
        forFrontend: true,
      });
    }
  });
};

// This is now your main response helper
export const sendResponse = (
  res: Response,
) => {
  res.status(200).json(resIfEmailSent);
};
