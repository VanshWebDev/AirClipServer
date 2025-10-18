import { type Request, type Response } from "express";

import mongoose from "mongoose";
import { generateJwtToken } from "./jwt.utils.js";
import { createCookie } from "../../helpers/authController/signup/signupFunc.js";

/**
 * Handles JWT token authentication by generating a JWT, setting it as a cookie,
 * optionally saving the payload into the session, and sending a response.
 *
 * @param {object} req - The request object from an Express.js route handler.
 * @param {object} res - The response object from an Express.js route handler.
 * @param {object|string} payload - The payload to include in the JWT token.
 *                                  If an object, expects an `email` property.
 * @param {object} otherInfo - An object containing additional information for token authentication.
 * @param {string} otherInfo.cookieName - The name of the cookie to set.
 * @param {number} otherInfo.statusCode - The HTTP status code for the response.
 * @param {string} otherInfo.message - The message to include in the JSON response.
 * @param {boolean} otherInfo.isNewUser - A flag indicating if the user is new or not.
 */

// Define the payload for the JWT token
interface TokenPayload {
  email: string;
  _id: string | mongoose.Types.ObjectId;
}

interface otherInfo {
  cookieName: string;
  statusCode: number;
  message: string;
  isNewUser: boolean;
}

// Define the user data structure to send to frontend
interface UserData {
  email: string;
  username: string;
  name?: string;
  profilePicture: string;
}
export const tokenAuth = async (
  req: Request,
  res: Response,
  payload: TokenPayload,
  otherInfo: otherInfo,
  userData: UserData,
  forWhat?: string
) => {
  const { cookieName, statusCode, ...responseInfo } = otherInfo;

  // const email = typeof payload === "string" ? payload : payload.email;

  const token = generateJwtToken(payload); //check in payload?.email condition

  if (token) createCookie(res, cookieName, token, forWhat);

  // if (isNewUser) await saveIntoDB(payload);

  res
    .status(statusCode)
    .json({ ...responseInfo, user: userData });
};
