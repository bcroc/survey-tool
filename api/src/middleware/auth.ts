import { Request, Response, NextFunction } from 'express';
import { jwtAuth } from './jwtAuth';
import { sendUnauthorized } from '../utils/response';

/**
 * Optional authentication middleware — tries to parse a JWT and attach
 * `req.user` if present, but never rejects the request.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // jwtAuth silently ignores invalid tokens and leaves req.user unset.
  return jwtAuth(req, res, next);
}

/**
 * Require authentication from either a session (Passport style) or a JWT.
 * On success `req.user` will be present; otherwise responds 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const maybeReq = req as unknown as { isAuthenticated?: () => boolean };
    if (typeof maybeReq.isAuthenticated === 'function' && maybeReq.isAuthenticated()) {
      return next();
    }
  } catch {
    // ignore
  }

  // Fall back to JWT-based auth
  jwtAuth(req, res, () => {
    const user = (req as unknown as { user?: unknown }).user;
    if (user) return next();
    return sendUnauthorized(res, 'Unauthorized');
  });
}
