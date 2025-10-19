import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized } from '../utils/response';

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return sendUnauthorized(res, 'Authentication required');
};

/**
 * Middleware to optionally attach user if authenticated
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // User is already attached by passport if authenticated
  next();
};
