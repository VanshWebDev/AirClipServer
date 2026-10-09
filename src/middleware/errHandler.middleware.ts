import type { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
  status?: number;
  forFrontend?: boolean;
}

export const errHandlerMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) return next(err);

  const requestedStatus = Number(err.status);
  const status =
    Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
      ? requestedStatus
      : 500;

  console.error("Request failed:", err);

  const message =
    err.forFrontend && err.message
      ? err.message
      : status < 500 && err.message
        ? err.message
        : "Internal server error";

  return res.status(status).json({ message });
};
