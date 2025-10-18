import { type Response } from "express";
export declare const generateOtp: () => number;
export declare const sendEmail: (res: Response, email: string, otp: number, key: string) => Promise<boolean>;
export declare const saveOtp: (email: string, otp: number) => Promise<void>;
export declare const sendResponse: (res: Response) => void;
//# sourceMappingURL=otpService.d.ts.map