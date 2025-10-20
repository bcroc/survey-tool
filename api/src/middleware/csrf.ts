import { NextFunction, Request, Response } from 'express';

// Unified header key for CSRF tokens
export const CSRF_HEADER = 'x-csrf-token';

/**
 * CSRF protection that supports both session-backed flows and stateless JWT flows.
 * - For safe methods (GET/HEAD/OPTIONS) it passes.
 * - For non-safe methods, if a session exists we expect a session CSRF token in header.
 * - If no session exists, require an Authorization header (Bearer token) and skip CSRF.
 */
export function csrfProtect(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  // If session exists (legacy cookie-based clients), require CSRF token header
  const hasSession = Boolean((req as any).session);
  if (hasSession) {
    const headerToken = req.get(CSRF_HEADER) as string | undefined;
    const sessionToken = (req as any).session?.csrfToken as string | undefined;
    if (!sessionToken) return res.status(403).json({ success: false, error: 'CSRF token missing from session' });
    if (!headerToken) return res.status(403).json({ success: false, error: 'CSRF token missing from request' });
    if (headerToken !== sessionToken) return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
    return next();
  }

  // No session: expect Authorization header (Bearer token) for stateless requests
  const auth = req.get('authorization') || req.headers['authorization'];
  if (!auth) return res.status(401).json({ success: false, error: 'Unauthenticated - missing Authorization' });
  return next();
}
