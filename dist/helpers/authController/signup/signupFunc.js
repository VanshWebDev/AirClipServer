import {} from "express";
// import { createCookieOptions, createCookieOptionsForAdmin } from "../../../constant/optionObj/optionObj";
import { PwdVerify } from "../../../models/pwdVerify.model.js";
import { createCookieOptions, createCookieOptionsForAdmin } from "../../../constant/optionObj/optionObj.js";
export const saveIntoDB = async (payload) => {
    const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    };
    const existUser = await PwdVerify.findOne({ email: user.email });
    if (existUser) {
        existUser.updateOne(user);
        return;
    }
};
/**
 * Sets an HTTP cookie on the response object.
 *
 * @param {object} res - The response object from an Express.js route handler.
 * @param {string} cookieName - The name of the cookie to set.
 * @param {string} token - The value to set for the cookie.
 * @param {string} forWhat - for whose this token is being created.
 */
export const createCookie = (res, cookieName, token, forWhat) => {
    if (forWhat == "FORADMIN")
        res.cookie(cookieName, token, createCookieOptionsForAdmin);
    else
        res.cookie(cookieName, token, createCookieOptions);
};
//# sourceMappingURL=signupFunc.js.map