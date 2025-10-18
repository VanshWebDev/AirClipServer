import { type JwtPayload } from "jsonwebtoken";
/**
 * Encrypts a message using AES encryption with a secret key.
 *
 * @param msg - The message to be encrypted.
 * @param secretKey - The secret key used for encryption.
 * @returns The encrypted message as a ciphertext, or an error message if encryption fails.
 */
export declare const encryptJwt: (msg: string, secretKey: string) => string;
/**
 * Decrypts a message using AES decryption with a secret key.
 *
 * @param msg - The encrypted message (ciphertext) to be decrypted.
 * @param secretKey - The secret key used for decryption.
 * @returns The decrypted message as plaintext, or an error message if decryption fails.
 */
export declare const decryptJwt: (toekn: string, secretKey: string) => JwtPayload | string;
//# sourceMappingURL=crypt.utils.d.ts.map