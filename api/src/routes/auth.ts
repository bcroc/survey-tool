import { Router } from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';
import crypto from 'crypto';

const router = Router();

// Login rate limiter (per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
});

// Login request validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    // Validate input early to avoid unnecessary work
    loginSchema.parse(req.body);
  } catch (err) {
    const msg = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
    return sendError(res, msg || 'Invalid login payload', 400);
  }

  passport.authenticate('local', (err: Error | null, user: { id: string; email: string } | false, info?: { message?: string }) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return sendError(res, info?.message || 'Authentication failed', 401);
    }

    req.logIn(user, (loginErr?: Error) => {
      if (loginErr) {
        return next(loginErr);
      }
      // Regenerate session to prevent session fixation attacks
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - express-session augments Request with `session`
      req.session.regenerate((regenErr?: Error | null) => {
        if (regenErr) {
          return next(regenErr);
        }
        // Re-attach user to session
        req.logIn(user, (loginErr2?: Error) => {
          if (loginErr2) {
            return next(loginErr2);
          }
          return sendSuccess(res, { user: { email: user.email } });
        });
      });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req, res, next) => {
  // Destroy session and logout
  req.logout((err) => {
    if (err) return next(err);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - express-session augments Request with `session`
    req.session.destroy((destroyErr?: Error | null) => {
      if (destroyErr) {
        return sendError(res, 'Logout failed', 500);
      }
      // Clear cookie on client
      res.clearCookie('sid');
      return sendSuccess(res, { loggedOut: true });
    });
  });
});

// Check authentication status
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return sendSuccess(res, { authenticated: true, user: req.user });
  }
  return sendSuccess(res, { authenticated: false });
});

export default router;

// CSRF token endpoint (useful for SPA to fetch token for stateful requests)
// Note: if csurf middleware is not active on the route that will receive the token,
// req.csrfToken may be undefined. This endpoint should be called from the frontend
// prior to making protected admin requests.
router.get('/csrf-token', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - express-session augments Request with `session`
  if (!req.session) return sendError(res, 'Unauthenticated', 401);

  // Ensure a token exists on the session
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!req.session.csrfToken) {
    // 32 bytes -> 64 hex chars
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return sendSuccess(res, { csrfToken: req.session.csrfToken });
});
