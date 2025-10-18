import {
  verifyotpIfInvalid,
  verifyotpIfExpire,
  ifCouldnotSetPwd,
} from "./errObj.js";
import { AirClipErr } from "../../../utils/error/AirClipErr.js";
import { OTP } from "../../../models/otp.model.js";
import { User } from "../../../models/user.model.js";

export const chkOtp = async (otp: string, userEmail: string) => {
  // Attempt to find the OTP record for the user
  const otpRecord = await OTP.findOne({ email: userEmail });

  // If the OTP record exists and the OTP matches the provided one, return true
  if (otpRecord) {
    if (otpRecord.otp === parseInt(otp)) return true;
    // If the OTP record exists but the OTP is invalid, throw an error
    else throw new AirClipErr(verifyotpIfInvalid);
    // If the OTP record exists but has expired, throw an error
  } else throw new AirClipErr(verifyotpIfExpire);
};

export const updateUser = async (
  selectedUser: string,
  hashedPassword: string
): Promise<void> => {
  await User.updateOne({ email: selectedUser }, { password: hashedPassword });
  if (!User) throw new AirClipErr(ifCouldnotSetPwd);
};
