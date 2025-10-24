import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { isProduction, isDevelopment } from '../config/env';
import { AppError } from '../utils/errors';

/**
 * Centralized Express error handler that maps application errors to responses.
 * Keeps `src/index.ts` focused on routing and server lifecycle.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Log the original error for observability
  logger.error({ err }, 'Unhandled error');

  // If error is an AppError, use its status and message directly
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // Defensive extraction for unknown errors
  const errObj = err as { statusCode?: number; status?: number; message?: unknown } | undefined;
  const statusCode = errObj?.statusCode || errObj?.status || 500;
  const errMessage = errObj?.message;

  const message = isProduction()
    ? statusCode === 500
      ? 'Internal server error'
      : String(errMessage)
    : String(errMessage) || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment() && { stack: (err as Error)?.stack }),
  });
}
