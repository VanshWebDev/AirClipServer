import {} from "express";
require("dotenv").config();
import {} from "jsonwebtoken";
import { checkIfMail } from "../utils/reusable/reusableFunc.js";
import { decryptJwt } from "../utils/token/crypt.utils.js";
import { checkTokenErr, checkTokenIfUserNot, } from "../helpers/authController/checktoken/errObj.js";
import { AirClipErr } from "../utils/error/AirClipErr.js";
import { User } from "../models/user.model.js";
const cryptoSecret = process.env.CRYPTO_SECRET || "";
export const checkIfAuth = async (req, res, next) => {
    try {
        const token = req.signedCookies.token;
        if (!token || token === false) {
            throw new AirClipErr(checkTokenErr); //Error if token not found in frontend.
        }
        else {
            const payload = decryptJwt(token, cryptoSecret);
            const { email } = payload;
            let user;
            if (checkIfMail(email)) {
                user = await User.findOne({ email: email });
            }
            if (!user) {
                throw new AirClipErr(checkTokenIfUserNot); //Error if token not found in frontend.
            }
            else {
                next();
            }
        }
    }
    catch (err) {
        res.status(401).json({
            status: 401,
            message: "Login or signup",
        });
    }
};
//# sourceMappingURL=checkIfAuth.middleware.js.map