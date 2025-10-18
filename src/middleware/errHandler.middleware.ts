import express from "express";

interface CustomError {
  status?: number;
  message?: string;
  forFrontend?: boolean;
}

export const errHandlerMiddleware = async (
  err: CustomError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { status = 500, message = "some error occured", forFrontend } = err;

  if (forFrontend) res.status(status).json({ message });
  console.log("🐞 Err Middlaware:", err);
  next();
};
