import { type Response } from "express";

// import { ifPasswordNotMatch } from "../../helpers/authController/login/errObj";
import { LoginTicket, OAuth2Client, type TokenPayload } from "google-auth-library";
import { ifPasswordNotMatch } from "../../helpers/authController/login/errObj.js";
import { AirClipErr } from "../error/AirClipErr.js";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(CLIENT_ID);
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

export const sendRes = (res: Response, resObj: resObj) => {
  const { statusCode, data } = resObj;
  res.status(statusCode).json(data);
};

export const getPayloadFromGoogle = async (
  token: string
): Promise<TokenPayload> => {
  const ticket: LoginTicket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Failed to retrieve payload from Google ID token.");
  }

  return payload;
};

/**
 * Checks if a given string is a valid Gmail address.
 * @param {string} emailOrUsername - The string to be checked, which can be either an email or a username.
 * @returns {boolean} Returns `true` if the string is a valid Gmail address, otherwise `false`.
 */
export const checkIfMail = (emailOrUsername: string) => {
  emailOrUsername = emailOrUsername.toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);
  const endsWithGmail = emailOrUsername.endsWith("@gmail.com");
  const endsWithEmail = emailOrUsername.endsWith("@email.com");
  return isEmail && (endsWithGmail || endsWithEmail);
};

/**
 *  Description: Validates if the provided password matches the confirmed password.
 * @function checkPassword
 * @param {string} password - The original password entered by the user.
 * @param {string} confirmPassword - The confirmation of the password to be checked against.
 */
export const checkPassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    throw new AirClipErr(ifPasswordNotMatch);
  }
  if (password === confirmPassword) return true;
};

//
//
// string checker
//
//
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
export const validateString = (
  str: string,
  {
    minLength = 1,
    maxLength = 300,
    allowSpecialChars = true,
    allowNumbers = true,
    disallowedPattern,
    stringName = "provided string",
  }: {
    minLength?: number;
    maxLength?: number;
    allowSpecialChars?: boolean;
    allowNumbers?: boolean;
    disallowedPattern?: RegExp;
    stringName?: string;
  } = {}
): void => {
  if (str.length < minLength) {
    throw new AirClipErr({
      status: 400,
      message: `${stringName} Minimum length is ${minLength}.`,
      forFrontend: true,
    });
  }

  if (str.length > maxLength) {
    throw new AirClipErr({
      status: 400,
      message: `${stringName} Maximum length is ${maxLength}.`,
      forFrontend: true,
    });
  }

  if (!allowSpecialChars && /[^a-zA-Z0-9\s]/.test(str)) {
    throw new AirClipErr({
      status: 400,
      message: `Special characters are not allowed in ${stringName}`,
      forFrontend: true,
    });
  }

  if (!allowNumbers && /\d/.test(str)) {
    throw new AirClipErr({
      status: 400,
      message: `Numbers are not allowed in ${stringName}`,
      forFrontend: true,
    });
  }

  if (disallowedPattern && disallowedPattern.test(str)) {
    throw new AirClipErr({
      status: 400,
      message: `Invalid characters detected in ${stringName}`,
      forFrontend: true,
    });
  }
};

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
export const validateNumber = (
  value: any,
  {
    min,
    max,
    allowFloat = true,
    allowZero = false,
    valueName = "Provided number",
  }: {
    min?: number;
    max?: number;
    allowFloat?: boolean;
    allowZero?: boolean;
    valueName?: string;
  } = {}
): void => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new AirClipErr({
      status: 400,
      message: `${valueName} is a Invalid number: ${value}`,
      forFrontend: true,
    });
  }

  if (!allowZero && value === 0) {
    throw new AirClipErr({
      status: 400,
      message: `${valueName} cannot be zero.`,
      forFrontend: true,
    });
  }

  if (!allowFloat && !Number.isInteger(value)) {
    throw new AirClipErr({
      status: 400,
      message: `Only integers are allowed in ${valueName}`,
      forFrontend: true,
    });
  }

  if (typeof min === "number" && value < min) {
    throw new AirClipErr({
      status: 400,
      message: `${valueName} must be at least ${min}.`,
      forFrontend: true,
    });
  }

  if (typeof max === "number" && value > max) {
    throw new AirClipErr({
      status: 400,
      message: `${valueName} must be less than ${max}.`,
      forFrontend: true,
    });
  }
};
