import { Response } from 'express';

/**
 * Standardized API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  meta?: Record<string, unknown>
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
}

/**
 * Send not found response (404)
 */
export function sendNotFound(res: Response, message: string = 'Resource not found'): Response {
  return sendError(res, message, 404);
}

/**
 * Send unauthorized response (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Authentication required'
): Response {
  return sendError(res, message, 401);
}

/**
 * Send validation error response (400)
 */
export function sendValidationError(
  res: Response,
  message: string = 'Validation failed',
  details?: Array<Record<string, unknown>>
): Response {
  return sendError(res, message, 400, { details });
}
