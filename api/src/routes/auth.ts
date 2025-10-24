import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import { rateLimiters } from '../middleware/rateLimiter';
import {
  authenticateAdmin,
  recordAdminLogin,
  issueSession,
  revokeRefreshToken,
  rotateRefreshToken,
  countAdminUsers,
  createAdminAccount,
  AdminEmailTakenError,
  mapAdminToSafe,
} from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { validate } from '../middleware/validation';

const router = Router();

const buildTokenMeta = (req: Request) => ({
  userAgent: req.get('user-agent') || null,
  ip: req.ip || null,
});

// Login request validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Login endpoint - supports both session and JWT auth
router.post(
  '/login',
  rateLimiters.auth,
  validate(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const admin = await authenticateAdmin(email, password);
      if (!admin) return sendError(res, 'Authentication failed', 401);

      const meta = buildTokenMeta(req);

      await recordAdminLogin(admin.id, meta);
      const session = await issueSession(admin, meta);

      res.cookie('refresh_token', session.refreshToken, session.cookieOptions);

      return sendSuccess(res, { token: session.accessToken, user: mapAdminToSafe(admin) });
    } catch {
      return sendError(res, 'Server error', 500);
    }
  }
);

// Logout
// Deletes refresh token (if provided) and clears cookie
router.post('/logout', async (req, res) => {
  try {
    const cookieToken = req.cookies?.refresh_token as string | undefined;
    if (cookieToken) {
      await revokeRefreshToken(cookieToken);
    }
    // Clear cookie in all environments; browser will remove on path '/'
    res.clearCookie('refresh_token', { path: '/' });
    return sendSuccess(res, { loggedOut: true });
  } catch {
    // On error, still clear cookie client-side
    res.clearCookie('refresh_token', { path: '/' });
    return sendSuccess(res, { loggedOut: true });
  }
});

// Check authentication status
// Accept session or JWT
router.get('/me', requireAuth, (req, res) => {
  const user = (req as unknown as { user?: unknown }).user;
  if (user) {
    return sendSuccess(res, { authenticated: true, user: req.user });
  }
  return sendSuccess(res, { authenticated: false });
});
//
// CSRF token endpoint (useful for SPA to fetch token for stateful requests)
// This endpoint is session-specific; JWT clients should rely on Authorization header
router.get('/csrf-token', (req, res) => {
  const sessionToken = (req as unknown as { session?: { csrfToken?: string } }).session
    ?.csrfToken as string | undefined;
  if (!sessionToken)
    return sendError(
      res,
      'No session CSRF token available. Use Authorization header with JWT for stateless requests.',
      204
    );
  return sendSuccess(res, { csrfToken: sessionToken });
});

// ============================================================
// First-time setup endpoints
// GET /auth/setup -> { needsSetup: boolean }
// POST /auth/setup -> create initial admin (only allowed when no admin exists)
// ============================================================

router.get('/setup', async (_req, res) => {
  try {
    const count = await countAdminUsers();
    return sendSuccess(res, { needsSetup: count === 0 });
  } catch {
    return sendError(res, 'Server error', 500);
  }
});

const setupSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

// Limit attempts to create admin to avoid abuse
const setupLimiter = rateLimiters.auth; // Reuse auth rate limiter for setup

router.post('/setup', setupLimiter, async (req, res) => {
  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid payload', 400);

  try {
    const count = await countAdminUsers();
    if (count > 0) return sendError(res, 'Setup already completed', 403);

    const { email, password } = parsed.data;
    const admin = await createAdminAccount(email, password, {
      createdBy: 'setup',
      auditMeta: { via: 'api' },
    });

    const meta = buildTokenMeta(req);
    const session = await issueSession(admin, meta);
    await recordAdminLogin(admin.id, meta);

    res.cookie('refresh_token', session.refreshToken, session.cookieOptions);

    return sendSuccess(res, { token: session.accessToken, admin });
  } catch (e) {
    if (e instanceof AdminEmailTakenError) {
      return sendError(res, 'Setup already completed', 403);
    }
    return sendError(res, 'Server error', 500);
  }
});

// Refresh access token using refresh_token cookie
router.post('/refresh', async (req, res) => {
  try {
    const cookieToken = req.cookies?.refresh_token as string | undefined;
    if (!cookieToken) return sendError(res, 'No refresh token', 401);

    const meta = buildTokenMeta(req);
    const rotated = await rotateRefreshToken(cookieToken, meta);
    if (!rotated) {
      res.clearCookie('refresh_token', { path: '/' });
      return sendError(res, 'Invalid refresh token', 401);
    }

    res.cookie('refresh_token', rotated.refreshToken, rotated.cookieOptions);

    return sendSuccess(res, { token: rotated.accessToken, user: rotated.admin });
  } catch {
    res.clearCookie('refresh_token', { path: '/' });
    return sendError(res, 'Server error', 500);
  }
});

export default router;
