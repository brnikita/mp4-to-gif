import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = 500;
    const message = 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    code: (error as ApiError).statusCode,
    message: error.message,
    ...(config.env === 'development' && { stack: error.stack })
  };

  if ((error as ApiError).statusCode >= 500) {
    logger.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
  } else {
    logger.warn('Client Error:', {
      error: error.message,
      path: req.path,
      method: req.method
    });
  }

  res.status((error as ApiError).statusCode).json(response);
}; 