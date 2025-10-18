import CryptoJS from "crypto-js";
import jwt, { type JwtPayload } from "jsonwebtoken";

// Retrieve JWT secret from environment variables
const jwtSecret = (process.env.JWT_SECRET as string) || undefined;

/**
 * Encrypts a message using AES encryption with a secret key.
 *
 * @param msg - The message to be encrypted.
 * @param secretKey - The secret key used for encryption.
 * @returns The encrypted message as a ciphertext, or an error message if encryption fails.
 */

export const encryptJwt = (msg: string, secretKey: string) => {
  // Check if the secret key is provided and valid
  if (secretKey && secretKey == secretKey) {
    // Perform AES encryption on the message using the provided secret key

    return CryptoJS.AES.encrypt(msg, secretKey).toString();
  } else return "crypto couldn't encrypt!";
};

/**
 * Decrypts a message using AES decryption with a secret key.
 *
 * @param msg - The encrypted message (ciphertext) to be decrypted.
 * @param secretKey - The secret key used for decryption.
 * @returns The decrypted message as plaintext, or an error message if decryption fails.
 */

export const decryptJwt = (
  toekn: string,
  secretKey: string
): JwtPayload | string => {
  // Check if both the secret key and JWT secret are provided and valid
  if (secretKey && jwtSecret && secretKey == secretKey) {
    // Perform AES decryption on the message using the provided secret key
    let bytes = CryptoJS.AES.decrypt(toekn, secretKey);

    return jwt.verify(
      bytes.toString(CryptoJS.enc.Utf8),
      jwtSecret
    ) as JwtPayload;
  } else return "crypto couldn't decrypt";
};
