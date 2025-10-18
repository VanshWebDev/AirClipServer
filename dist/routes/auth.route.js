import express from "express";
import { routeWrapper } from "../utils/error/routeWrapper.js";
import { forgetpassword, login, sendOtp, signupWithEmail, signupWithGoogle, verifyOtp, verifyOtpForSignup, } from "../controller/auth.controller.js";
const router = express.Router();
router.post("/login", routeWrapper(login));
router.post("/sendotp", routeWrapper(sendOtp));
router.post("/verifyotpforsignup", routeWrapper(verifyOtpForSignup));
router.post("/signupwithemail", routeWrapper(signupWithEmail));
router.post("/signupwithgoogle", routeWrapper(signupWithGoogle));
router.post("/forget-pwd", routeWrapper(forgetpassword));
router.post("/verify-otp", routeWrapper(verifyOtp));
export default router;
//# sourceMappingURL=auth.route.js.map