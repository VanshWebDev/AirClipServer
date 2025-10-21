//mongodb models
import { VerifyEmailOtp } from "../models/verifyEmailOtps.model.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
//User defined error class
import { AirClipErr } from "../utils/error/AirClipErr.js";
//npm packeges
import bcrypt from "bcrypt";
//Error objects
import { ifCheckuserNot, ifUserDidntCreatedPassword, loginErr, loginErr1, } from "../helpers/authController/login/errObj.js";
import { ifEmailAlreadySent, ifEmailNot, ifUserWithEmailExist, } from "../helpers/authController/sendOpt/errObj.js";
import { ifOtpNotMatch, ifOtpWithEmailNot, } from "../helpers/authController/verifyOtpForSignup/errObj.js";
import { ifBothPwdNotEqual, ifUserExist, wrongEmailProvided, } from "../helpers/authController/signupWithEmail/errObj.js";
import { ifGooglePayloadNot } from "../helpers/authController/signupWithGoogle/errObj.js";
import { ifPwdNotEqual, ifUserResetingPwdNotFound, } from "../helpers/authController/verifyOtp/errObj.js";
import { forgetpwdIfUsername, forgetpwdIfUserNot, } from "../helpers/authController/forgetPwd/errObj.js";
import { checkTokenErr, checkTokenIfUserNot } from "../helpers/authController/checktoken/errObj.js";
//response objects
import { resIfPasswordMatch } from "../helpers/authController/login/resObj.js";
import { resIfEmailSent } from "../helpers/authController/sendOpt/resObj.js";
import { ifOtpMatch } from "../helpers/authController/verifyOtpForSignup/resObj.js";
import { ifUserCreatedSuccessfully } from "../helpers/authController/signupWithEmail/resObj.js";
import { ifSignupSuccessWithGoogle, ifUserExistSignin, } from "../helpers/authController/signupWithGoogle/resObj.js";
import { chkOtp, updateUser, } from "../helpers/authController/verifyOtp/verifyoptFunc.js";
import { verifyotpIfPwdSuccessfullyReset } from "../helpers/authController/verifyOtp/resObj.js";
//utilites
import { checkIfMail, getPayloadFromGoogle, sendRes, } from "../utils/reusable/reusableFunc.js";
import { tokenAuth } from "../utils/token/tokenAuth.js";
import { generateOtp, saveOtp, sendEmail, sendResponse, } from "../utils/reusable/otpService.js";
import { extractUsernameFromEmail } from "../helpers/authController/signupWithEmail/signupWithEmailFunc.js";
import { decryptJwt } from "../utils/token/crypt.utils.js";
import { getUser, resIfUserObj } from "../helpers/authController/checktoken/checktokenFunc.js";
const cryptoSecret = process.env.CRYPTO_SECRET || "";
export const login = async (req, res) => {
    let { emailOrUsername, password } = req.body;
    emailOrUsername = emailOrUsername.toLowerCase();
    let checkuser;
    if (checkIfMail(emailOrUsername)) {
        checkuser = await User.findOne({ email: emailOrUsername }).select("+password");
    }
    else {
        checkuser = await User.findOne({ affiname: emailOrUsername }).select("+password");
    }
    if (!checkuser)
        throw new AirClipErr(ifCheckuserNot);
    const tokenObj = {
        email: checkuser?.email,
        _id: checkuser._id,
    };
    if (!checkuser) {
        throw new AirClipErr(loginErr);
    }
    if (!checkuser.password)
        throw new AirClipErr(ifUserDidntCreatedPassword);
    else {
        const isMatch = await bcrypt.compare(password, checkuser.password);
        if (isMatch) {
            // Data to send to the frontend
            const userData = {
                email: checkuser.email,
                username: checkuser.username,
                name: checkuser.name ?? "",
                profilePicture: checkuser.profilePicture ?? "",
                _id: checkuser._id.toString(),
            };
            tokenAuth(req, res, tokenObj, resIfPasswordMatch, userData);
        }
        else {
            throw new AirClipErr(loginErr1);
        }
    }
};
export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new AirClipErr(ifEmailNot);
    const user = await User.findOne({ email });
    if (user)
        throw new AirClipErr(ifUserWithEmailExist);
    const otp = generateOtp();
    const createdOtp = await VerifyEmailOtp.findOne({ email });
    if (createdOtp)
        throw new AirClipErr(ifEmailAlreadySent);
    const isOtpSent = await sendEmail(res, email, otp, "Email verification");
    if (isOtpSent)
        sendRes(res, resIfEmailSent);
    await VerifyEmailOtp.create({ email, otp });
};
export const verifyOtpForSignup = async (req, res) => {
    const { email, otp } = req.body;
    const createdOtp = await VerifyEmailOtp.findOne({ email });
    if (!createdOtp)
        throw new AirClipErr(ifOtpWithEmailNot);
    if (createdOtp.otp !== Number(otp))
        throw new AirClipErr(ifOtpNotMatch);
    sendRes(res, ifOtpMatch);
};
export const signupWithEmail = async (req, res) => {
    //done 🟢
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
        throw new AirClipErr(ifBothPwdNotEqual);
    const exist = await User.findOne({ email });
    if (exist)
        throw new AirClipErr(ifUserExist);
    if (!email || typeof email !== "string")
        throw new AirClipErr(wrongEmailProvided);
    const username = extractUsernameFromEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
    });
    const tokenObj = {
        email: newUser?.email,
        _id: newUser._id,
    };
    // Data to send to the frontend
    const userData = {
        email: newUser.email,
        username: newUser.username,
        name: newUser.name ?? "",
        profilePicture: newUser.profilePicture ?? "",
        _id: newUser._id.toString(),
    };
    tokenAuth(req, res, tokenObj, ifUserCreatedSuccessfully, userData);
    await VerifyEmailOtp.deleteOne({ email });
};
export const signupWithGoogle = async (req, res) => {
    const { token } = req.body;
    const payload = await getPayloadFromGoogle(token);
    if (!payload || !payload.email)
        throw new AirClipErr(ifGooglePayloadNot);
    const { email, name, picture } = payload;
    const user = await User.findOne({ email });
    // simply login the user if exist
    if (user) {
        if (!user.name && name) {
            user.name = name;
            await user.save(); // Save the updated details to the database
        }
        // Payload for the JWT
        const tokenPayload = {
            email: user.email,
            _id: user._id,
        };
        // Data to send to the frontend
        const userData = {
            email: user.email,
            username: user.username,
            name: user.name ?? "",
            profilePicture: user.profilePicture ?? "",
            _id: user._id.toString(),
        };
        return tokenAuth(req, res, tokenPayload, ifUserExistSignin, userData);
    }
    //create new user if doesn't exist
    const username = extractUsernameFromEmail(email);
    const newUser = await User.create({ username, email, name, picture });
    // Payload for the JWT
    const tokenPayload = {
        email: newUser.email,
        _id: newUser._id,
    };
    // Data to send to the frontend
    const userData = {
        email: newUser.email,
        username: newUser.username,
        name: newUser.name ?? "",
        profilePicture: newUser.profilePicture ?? "",
        _id: newUser._id.toString(),
    };
    if (newUser) {
        tokenAuth(req, res, tokenPayload, ifSignupSuccessWithGoogle, userData);
    }
};
export const forgetpassword = async (req, res) => {
    // Get emailOrUsername and convert to lowercase immediately
    const emailOrUsername = req.body.emailOrUsername?.toLowerCase();
    console.log(emailOrUsername);
    let isEmail = checkIfMail(emailOrUsername);
    if (!isEmail)
        throw new AirClipErr(forgetpwdIfUsername);
    const user = await User.findOne({ email: emailOrUsername });
    if (!user)
        throw new AirClipErr(forgetpwdIfUserNot);
    const email = user.email;
    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendEmail(res, email, otp, "forgetpassword");
    sendResponse(res);
};
export const verifyOtp = async (req, res) => {
    // done🟢
    const { otp, newPassword, confirmPassword, email } = req.body;
    if (newPassword !== confirmPassword)
        throw new AirClipErr(ifPwdNotEqual);
    await chkOtp(otp, email);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true });
    await OTP.deleteOne({ email });
    if (!updatedUser)
        throw new AirClipErr(ifUserResetingPwdNotFound);
    // Payload for the JWT
    const tokenPayload = {
        email: updatedUser?.email,
        _id: updatedUser?._id,
    };
    const userData = {
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name ?? "",
        profilePicture: updatedUser.profilePicture ?? "",
        _id: updatedUser._id.toString(),
    };
    tokenAuth(req, res, tokenPayload, verifyotpIfPwdSuccessfullyReset, userData);
};
export const checkToken = async (req, res) => {
    const token = req.signedCookies.token;
    if (!token)
        throw new AirClipErr(checkTokenErr); //Error if token not found in frontend.
    const payload = decryptJwt(token, cryptoSecret);
    const { _id } = payload;
    // if (checkIfMail(payload.email)) user = await getUserIfEamil(email);
    //
    // else user = await getUserIfUsername(email);
    const user = await getUser(_id);
    if (!user)
        throw new AirClipErr(checkTokenIfUserNot);
    //
    else
        sendRes(res, resIfUserObj(user));
};
//# sourceMappingURL=auth.controller.js.map