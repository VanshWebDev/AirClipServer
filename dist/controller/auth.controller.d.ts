import type { Request as Rq, Response as Rs } from "express";
export declare const login: (req: Rq, res: Rs) => Promise<void>;
export declare const sendOtp: (req: Rq, res: Rs) => Promise<void>;
export declare const verifyOtpForSignup: (req: Rq, res: Rs) => Promise<void>;
export declare const signupWithEmail: (req: Rq, res: Rs) => Promise<void>;
export declare const signupWithGoogle: (req: Rq, res: Rs) => Promise<void>;
export declare const forgetpassword: (req: Rq, res: Rs) => Promise<void>;
export declare const verifyOtp: (req: Rq, res: Rs) => Promise<void>;
export declare const checkToken: (req: Rq, res: Rs) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map