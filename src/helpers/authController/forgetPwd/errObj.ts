export const forgetpwdIfUserNot = {
  status: 404,
  message: "user not found",
  forFrontend: true,
};
export const forgetpwdIfDuplicatekay = {
  status: 400,
  message: "OTP already sent",
  forFrontend: true,
};
export const forgetpwdIfUsername = {
  status: 400,
  message: "enter only mail",
  forFrontend: true,
};
export const couldntSendOtp = {
  status: 400,
  message: "couldn't send otp",
  forFrontend: true,
};
