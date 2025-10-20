import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export interface JwtPayload {
  id: string;
  email?: string;
}

export function jwtAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization || req.cookies?.Authorization;
  if (!auth) return next();

  const token = String(auth).startsWith('Bearer ') ? String(auth).slice(7) : String(auth);
  try {
    const payload = verifyJwt<JwtPayload>(token);
    // Attach user-ish object compatible with passport's `req.user`
    (req as any).user = { id: payload.id, email: payload.email };
  } catch (e) {
    // Ignore invalid token and move on; route-level auth can decide to reject
  }

  return next();
}
