import {} from "express";
import mongoose from "mongoose";
import { generateJwtToken } from "./jwt.utils.js";
import { createCookie } from "../../helpers/authController/signup/signupFunc.js";
export const tokenAuth = async (req, res, payload, otherInfo, userData, forWhat) => {
    const { cookieName, statusCode, ...responseInfo } = otherInfo;
    // const email = typeof payload === "string" ? payload : payload.email;
    const token = generateJwtToken(payload); //check in payload?.email condition
    if (token)
        createCookie(res, cookieName, token, forWhat);
    // if (isNewUser) await saveIntoDB(payload);
    res
        .status(statusCode)
        .json({ ...responseInfo, user: userData });
};
//# sourceMappingURL=tokenAuth.js.map