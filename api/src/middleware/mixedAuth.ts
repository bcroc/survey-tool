import { Request, Response, NextFunction } from 'express';
import { jwtAuth } from './jwtAuth';

export function mixedAuth(req: Request, res: Response, next: NextFunction) {
  // If Passport/session set req.isAuthenticated and user, honor it
  try {
    if (typeof (req as any).isAuthenticated === 'function' && (req as any).isAuthenticated()) {
      return next();
    }
  } catch (e) {
    // ignore
  }

  // Otherwise try JWT auth which sets req.user
  jwtAuth(req, res, () => {
    if ((req as any).user) return next();
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  });
}
