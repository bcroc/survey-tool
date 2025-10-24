import { Application } from 'express';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { logger } from '../config/logger';
import { config, isProduction, isDevelopment } from '../config/env';
// Session middleware removed; JWT-based auth used instead.
import { rateLimiters } from '../middleware/rateLimiter';
import { csrfProtect } from '../middleware/csrf';

/**
 * Register global middleware onto the provided Express app.
 * Keeps `index.ts` focused on wiring routes and lifecycle.
 */
export function setupMiddleware(app: Application) {
  // Hide Express signature
  app.disable('x-powered-by');

  // HTTP logger
  app.use(pinoHttp({ logger: logger as unknown as import('pino').Logger<string, boolean> }));

  // Security middleware
  app.use(
    helmet({
      // Keep CSP disabled by default to avoid breaking the SPA unless configured.
      contentSecurityPolicy: isProduction() ? undefined : false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'no-referrer' },
      // HSTS header is automatically set by helmet when HTTPS is used.
    })
  );

  // CORS
  app.use(
    cors({
      origin: config.frontend.url,
      credentials: true,
    })
  );

  // Response compression
  app.use(compression());

  // Body parsing
  app.use((require('express') as typeof import('express')).json({ limit: '10mb' }));
  app.use(
    (require('express') as typeof import('express')).urlencoded({ extended: true, limit: '10mb' })
  );

  // Application supports both stateless JWT auth and session-based auth

  // Apply rate limiters based on route type
  app.use('/api/surveys', rateLimiters.public);
  app.use('/api/submissions', rateLimiters.submission);
  app.use('/api/contacts', rateLimiters.submission);
  app.use('/api/auth', rateLimiters.auth);

  // CSRF protection will be applied by route where needed
  // Routes that need CSRF should import and use csrfProtect explicitly
  (app as unknown as Record<string, unknown>).csrfProtect = csrfProtect;
}

export { csrfProtect };
