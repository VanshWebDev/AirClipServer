import { type Response } from "express";
import { type TokenPayload } from "google-auth-library";
/**
 * Sends an HTTP response with the specified status code and JSON object.
 *
 * @param {object} res - The response object from an Express.js route handler.
 * @param {object} resObj - An object containing the status code and the JSON response body.
 * @param {number} resObj.statusCode - The HTTP status code for the response.
 * @param {object} resObj.jsonObj - The JSON object to include in the response body.
 */
interface resObj {
    statusCode: number;
    data: object;
}
export declare const sendRes: (res: Response, resObj: resObj) => void;
export declare const getPayloadFromGoogle: (token: string) => Promise<TokenPayload>;
/**
 * Checks if a given string is a valid Gmail address.
 * @param {string} emailOrUsername - The string to be checked, which can be either an email or a username.
 * @returns {boolean} Returns `true` if the string is a valid Gmail address, otherwise `false`.
 */
export declare const checkIfMail: (emailOrUsername: string) => boolean;
/**
 *  Description: Validates if the provided password matches the confirmed password.
 * @function checkPassword
 * @param {string} password - The original password entered by the user.
 * @param {string} confirmPassword - The confirmation of the password to be checked against.
 */
export declare const checkPassword: (password: string, confirmPassword: string) => true | undefined;
/**
 * Validates a string based on specified criteria.
 *
 * @param str - The string to validate.
 * @param options - Validation options to customize the checks.
 * @param options.minLength - Minimum allowed string length. Defaults to 1.
 * @param options.maxLength - Maximum allowed string length. Defaults to 300.
 * @param options.allowSpecialChars - Whether special characters are allowed. Defaults to true.
 * @param options.allowNumbers - Whether numbers are allowed. Defaults to true.
 * @param options.disallowedPattern - A RegExp pattern that must not be matched.
 * @param options.stringName - String name to thorow error with string name.
 *
 * @throws {AirClipErr} If the string does not meet the validation criteria.
 */
export declare const validateString: (str: string, { minLength, maxLength, allowSpecialChars, allowNumbers, disallowedPattern, stringName, }?: {
    minLength?: number;
    maxLength?: number;
    allowSpecialChars?: boolean;
    allowNumbers?: boolean;
    disallowedPattern?: RegExp;
    stringName?: string;
}) => void;
/**
 * Validates a number based on specified constraints.
 *
 * @param value - The number to validate.
 * @param options - An object with optional constraints.
 * @param options.min - Minimum allowed value (inclusive).
 * @param options.max - Maximum allowed value (inclusive).
 * @param options.allowFloat - Whether to allow floating-point numbers. Defaults to true.
 * @param options.allowZero - Whether zero is allowed. Defaults to false.
 *
 * @throws {AirClipErr} If the number is invalid based on the provided constraints.
 */
export declare const validateNumber: (value: any, { min, max, allowFloat, allowZero, valueName, }?: {
    min?: number;
    max?: number;
    allowFloat?: boolean;
    allowZero?: boolean;
    valueName?: string;
}) => void;
export {};
//# sourceMappingURL=reusableFunc.d.ts.map