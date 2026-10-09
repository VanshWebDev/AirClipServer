import {
  verifyotpIfInvalid,
  verifyotpIfExpire,
  ifCouldnotSetPwd,
} from "./errObj.js";
import { AirClipErr } from "../../../utils/error/AirClipErr.js";
import { OTP } from "../../../models/otp.model.js";
import { User } from "../../../models/user.model.js";

export const chkOtp = async (otp: string, userEmail: string) => {
  const otpRecord = await OTP.findOne({ email: userEmail });
  if (!otpRecord) throw new AirClipErr(verifyotpIfExpire);
  if (otpRecord.otp !== Number.parseInt(otp, 10)) {
    throw new AirClipErr(verifyotpIfInvalid);
  }
  return true;
};

export const updateUser = async (
  selectedUser: string,
  hashedPassword: string,
): Promise<void> => {
  const result = await User.updateOne(
    { email: selectedUser },
    { password: hashedPassword },
  );
  if (result.modifiedCount === 0) {
    throw new AirClipErr(ifCouldnotSetPwd);
  }
};
