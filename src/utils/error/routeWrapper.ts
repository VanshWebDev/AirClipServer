import { type NextFunction, type Request, type Response } from "express";

/**
 * Wraps an asynchronous route handler to automatically catch errors and pass them to the next middleware.
 *
 * This function is particularly useful for simplifying error handling in Express applications.
 * Instead of wrapping each async route handler with a `try`/`catch` block, you can use `routeWrapper`
 * to streamline the process.
 *
 * @param {Function} fn - The asynchronous route handler function to be wrapped. This function should accept
 *                        the parameters `(req, res, next)` and return a Promise.
 * @returns {Function} A new function that wraps the provided route handler and catches any errors,
 *                     forwarding them to the next middleware using `next(err)`.
 */

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const routeWrapper = (fn: AsyncMiddleware) => {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
