import mongoose from "mongoose";
/**
 * Generates a JWT token for the given email, signs it with a secret key,
 * encrypts the token, and returns the encrypted token.
 *
 * @param email - The email for which the JWT token is generated. This parameter is required.
 * @returns The encrypted JWT token as a string, or undefined if the JWT secret or crypto secret is not set.
 */
export declare const generateJwtToken: (payload: {
    email: string;
    _id?: string | mongoose.Types.ObjectId;
}) => string | undefined;
//# sourceMappingURL=jwt.utils.d.ts.map