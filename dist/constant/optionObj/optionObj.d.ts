import { type CorsOptions } from "cors";
import { type CookieOptions } from "express";
export declare const corsOptions: CorsOptions;
export declare const socketIoOptions: {
    origin: string;
    methods: string[];
    credentials: boolean;
};
export declare const expressSessionOptions: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
        maxAge: number;
    };
};
export declare const createCookieOptions: CookieOptions;
export declare const createCookieOptionsForAdmin: CookieOptions;
//# sourceMappingURL=optionObj.d.ts.map