import { type Response } from "express";
/**
 * Saves user information into the session object.
 * @param {object} payload - The payload containing user information to be saved.
 * @param {object} req - The request object from an Express.js route handler.
 */
interface payload {
    email: string;
    sub: string;
    name: string;
    picture: string;
}
export declare const saveIntoDB: (payload: payload) => Promise<void>;
/**
 * Sets an HTTP cookie on the response object.
 *
 * @param {object} res - The response object from an Express.js route handler.
 * @param {string} cookieName - The name of the cookie to set.
 * @param {string} token - The value to set for the cookie.
 * @param {string} forWhat - for whose this token is being created.
 */
export declare const createCookie: (res: Response, cookieName: string, token: string, forWhat?: string) => void;
export {};
//# sourceMappingURL=signupFunc.d.ts.map