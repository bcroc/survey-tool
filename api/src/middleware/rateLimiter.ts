import rateLimit from 'express-rate-limit';
import { isProduction } from '../config/env';

const BASE_MESSAGE = 'Too many requests from this IP, please try again later.';

export const rateLimiters = {
  // Authentication rate limits
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction() ? 10 : 100, // Stricter in production
    message: BASE_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Public API rate limits
  public: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction() ? 100 : 1000,
    message: BASE_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Submission rate limits (more restrictive)
  submission: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProduction() ? 10 : 50,
    message: BASE_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
  }),
};
