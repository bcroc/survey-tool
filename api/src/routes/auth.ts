import { Router } from 'express';
import passport from 'passport';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return sendError(res, info?.message || 'Authentication failed', 401);
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return sendSuccess(res, { user: { email: user.email } });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return sendError(res, 'Logout failed', 500);
    }
    return sendSuccess(res, { loggedOut: true });
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
