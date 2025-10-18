export const ifEmailNot = {
    status: 404,
    message: "Email not found",
    forFrontend: true,
};
export const ifEmailAlreadySent = {
    status: 400,
    message: "OTP already sent",
    forFrontend: true,
};
export const ifTheUserRequestingOtpAlreadyExist = {
    status: 400,
    message: "An user with this email already exist",
    forFrontend: true,
};
export const ifUserWithEmailExist = {
    status: 409,
    message: "User with email already exist! Login instead.",
    forFrontend: true,
};
//# sourceMappingURL=errObj.js.map