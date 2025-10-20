import { Application } from 'express';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { logger } from '../config/logger';
import { config, isProduction, isDevelopment } from '../config/env';
// Session middleware removed; JWT-based auth used instead.
import { publicLimiter, submissionLimiter } from '../utils/rateLimiter';
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
  app.use((require('express') as typeof import('express')).urlencoded({ extended: true, limit: '10mb' }));

  // No session or passport middleware — application uses stateless JWT auth.

  // Rate limiters - call factory at init time
  app.use('/api/surveys', publicLimiter());
  app.use('/api/submissions', submissionLimiter());
  app.use('/api/contacts', submissionLimiter());

  // CSRF protection will be applied by route where needed (example: admin)
  // Note: routes that need csrf should import and use `csrfProtect` explicitly.
  // We export it for convenience.
  (app as any).csrfProtect = csrfProtect;
}

export { csrfProtect };
