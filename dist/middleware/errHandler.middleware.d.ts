import express from "express";
interface CustomError {
    status?: number;
    message?: string;
    forFrontend?: boolean;
}
export declare const errHandlerMiddleware: (err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=errHandler.middleware.d.ts.map