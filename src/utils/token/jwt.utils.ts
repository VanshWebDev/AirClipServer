import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// .env variables
const jwtSecret = process.env.JWT_SECRET as string;
const cryptoSecret = process.env.CRYPTO_SECRET as string;
/**
 * Generates a JWT token for the given email, signs it with a secret key,
 * encrypts the token, and returns the encrypted token.
 *
 * @param email - The email for which the JWT token is generated. This parameter is required.
 * @returns The encrypted JWT token as a string, or undefined if the JWT secret or crypto secret is not set.
 */
export const generateJwtToken = (payload: {
  email: string;
  _id?: string | mongoose.Types.ObjectId,
}): string | undefined => {
  if (!jwtSecret || !cryptoSecret) return undefined;

  // Payload for the JWT
  const payloadObj = {
    email: payload.email,
    _id: payload._id?.toString(),
  };

  // Generate JWT token
  const token = jwt.sign(payloadObj, jwtSecret, {
    expiresIn: 30 * 24 * 60 * 60,
  }); // 30 days, to change: expiresIn is in seconds (24 hours)

  // Encrypt the JWT token
  const encryptedJwtToken = CryptoJS.AES.encrypt(
    token,
    cryptoSecret
  ).toString();

  return encryptedJwtToken;
};