import { Router } from 'express';
import { mixedAuth } from '../middleware/mixedAuth';
import bcrypt from 'bcrypt';
import { prisma } from '../services/database';
import { signJwt } from '../utils/jwt';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';

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
router.post('/login', loginLimiter, async (req, res) => {
  try {
    // Validate input early to avoid unnecessary work
    loginSchema.parse(req.body);
  } catch (err) {
    const msg = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
    return sendError(res, msg || 'Invalid login payload', 400);
  }

  const { email, password } = req.body as { email: string; password: string };
  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return sendError(res, 'Authentication failed', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return sendError(res, 'Authentication failed', 401);

    // Update last login and audit
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    await prisma.auditLog.create({ data: { adminId: user.id, action: 'LOGIN' } });

    const token = signJwt({ id: user.id, email: user.email });
    return sendSuccess(res, { token });
  } catch (e) {
    return sendError(res, 'Server error', 500);
  }
});

// Logout
// Stateless logout: client should discard token. We return success to keep parity.
router.post('/logout', (_req, res) => {
  return sendSuccess(res, { loggedOut: true });
});

// Check authentication status
// Accept session or JWT
router.get('/me', mixedAuth, (req, res) => {
  if ((req as any).user) {
    return sendSuccess(res, { authenticated: true, user: req.user });
  }
  return sendSuccess(res, { authenticated: false });
});
//
// CSRF token endpoint (useful for SPA to fetch token for stateful requests)
// This endpoint is session-specific; JWT clients should rely on Authorization header
router.get('/csrf-token', (req, res) => {
  const sessionToken = (req as any).session?.csrfToken as string | undefined;
  if (!sessionToken) return sendError(res, 'No session CSRF token available. Use Authorization header with JWT for stateless requests.', 204);
  return sendSuccess(res, { csrfToken: sessionToken });
});

export default router;
