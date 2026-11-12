import type { NextFunction, Request, Response } from 'express';

type CustomError = Error & { statusCode?: number };

export const errorHandler = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Internal Server Error',
  });
};
