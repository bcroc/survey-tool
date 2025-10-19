import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import pinoHttp from 'pino-http';
import connectPgSimple from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
// We'll use a small, well-tested session-backed CSRF implementation instead of
// the `csurf` package to avoid depending on older `cookie` versions.
import pg from 'pg';

// Config and services
import { config, isProduction, isDevelopment } from './config/env';
import { logger } from './config/logger';
import { configurePassport } from './config/passport';
import { disconnectDatabase } from './services/database';

// Routes
import submissionRoutes from './routes/submissions';
import contactRoutes from './routes/contacts';
import surveyRoutes from './routes/surveys';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';

const app: Application = express();

// When running behind a proxy (e.g., load balancer) ensure Express is aware
// so secure cookies and IPs are handled correctly in production.
if (isProduction()) {
  app.set('trust proxy', 1);
}

// HTTP logger
// pino v10 introduced stricter generics which can be noisy here; cast to a compatible
// logger type for pino-http to avoid complex generic plumbing in the app entry.
app.use(pinoHttp({ logger: logger as unknown as import('pino').Logger<string, boolean> }));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: isProduction() ? undefined : false,
  })
);

// CORS
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for public endpoints
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many submissions from this IP, please try again later.',
});

// Session store
const PgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: config.database.url,
});

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'Session',
      createTableIfMissing: false,
    }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
      // Only set the secure flag for cookies in production where HTTPS is expected.
      secure: isProduction(),
      httpOnly: true,
      maxAge: config.session.maxAge,
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (with rate limiting)
app.use('/api/surveys', publicLimiter, surveyRoutes);
app.use('/api/submissions', submissionLimiter, submissionRoutes);
app.use('/api/contacts', submissionLimiter, contactRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Simple session-backed CSRF middleware.
// It stores a random token on the session and expects it to be sent back in
// the `X-CSRF-Token` header for state-changing requests on protected routes.

// Narrow `Request` to include the `session` object we expect from
// `express-session`. This avoids repetitive `@ts-ignore` comments.
type SessionLike = Record<string, unknown> & { csrfToken?: string };

type SessionRequest = Request & { session?: SessionLike };

const csrfHandler = (req: SessionRequest, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  if (!req.session) return res.status(401).json({ success: false, error: 'Unauthenticated' });

  const headerToken = (req.get('x-csrf-token') as string) || (req.headers['x-csrf-token'] as string | undefined);
  const sessionToken = req.session?.csrfToken as string | undefined;

  if (!sessionToken) return res.status(403).json({ success: false, error: 'CSRF token missing from session' });
  if (!headerToken) return res.status(403).json({ success: false, error: 'CSRF token missing from request' });
  if (headerToken !== sessionToken) return res.status(403).json({ success: false, error: 'Invalid CSRF token' });

  return next();
};

// Admin routes (protected) - apply CSRF to admin routes which rely on cookies/sessions
app.use('/api/admin', csrfHandler, adminRoutes);

// Serve static frontend files in production
if (isProduction()) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handling
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Log the error object safely
  logger.error({ err }, 'Unhandled error');

  // Determine status code
  // Defensive extraction of status and message
  // Extract known error fields defensively from unknown
  const errObj = err as { statusCode?: number; status?: number; message?: unknown } | undefined;
  const statusCode = errObj?.statusCode || errObj?.status || 500;

  const errMessage = errObj?.message;
  const message = isProduction()
    ? (statusCode === 500 ? 'Internal server error' : String(errMessage))
    : (String(errMessage) || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment() && { stack: (err as Error)?.stack }),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Start server only when not running in test environment
let server: ReturnType<typeof app.listen> | undefined;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
    logger.info(`📡 API: http://localhost:${config.port}/api`);
    if (isProduction()) {
      logger.info(`🌐 Frontend: http://localhost:${config.port}`);
    } else {
      logger.info(`🌐 Frontend (dev): ${config.frontend.url}`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server?.close(async () => {
      await disconnectDatabase();
      await pgPool.end();
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

export default app;
