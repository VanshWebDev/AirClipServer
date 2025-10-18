import express from "express";
export const errHandlerMiddleware = async (err, req, res, next) => {
    const { status = 500, message = "some error occured", forFrontend } = err;
    if (forFrontend)
        res.status(status).json({ message });
    console.log("🐞 Err Middlaware:", err);
    next();
};
//# sourceMappingURL=errHandler.middleware.js.map