export const verifyotpIfInvalid = {
    status: 400,
    message: "Invalid OTP",
    forFrontend: true,
};
export const verifyotpIfExpire = {
    status: 404,
    message: "OTP expired generate new one",
    forFrontend: true,
};
export const ifPwdNotEqual = {
    status: 400,
    message: "Password doesn't match",
    forFrontend: true
};
export const ifCouldnotSetPwd = {
    status: 400,
    message: "Password doesn't match",
    forFrontend: true
};
export const ifUserResetingPwdNotFound = {
    status: 400,
    message: "User not found with this email!",
    forFrontend: true
};
//# sourceMappingURL=errObj.js.map