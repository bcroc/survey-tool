import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import { setupMiddleware } from './setup/middleware';
import { csrfProtect } from './middleware/csrf';

// Config and services
import { config, isProduction, isDevelopment } from './config/env';
import { logger } from './config/logger';
import { disconnectDatabase, prisma } from './services/database';
// CSRF protection is applied selectively to routes that need it

// Routes
import submissionRoutes from './routes/submissions';
import contactRoutes from './routes/contacts';
import surveyRoutes from './routes/surveys';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import authJwtRoutes from './routes/auth-jwt';

const app: Application = express();

// When running behind a proxy (e.g., load balancer) ensure Express is aware
// so secure cookies and IPs are handled correctly in production.
if (isProduction()) {
  app.set('trust proxy', 1);
}

// Register common middleware (logger, helmet, cors, body-parsing, session, passport, rate-limit)
setupMiddleware(app);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness: verify DB connectivity
app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (e) {
    res.status(503).json({ status: 'degraded' });
  }
});

// Public routes (with rate limiting)
app.use('/api/surveys', surveyRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contacts', contactRoutes);

// Auth routes
app.use('/api/auth', authRoutes);
// JWT auth (explicit namespace to avoid conflicts and match tests)
app.use('/api/auth/jwt', authJwtRoutes);

// Admin routes (protected) - apply CSRF to admin routes which rely on cookies/sessions
app.use('/api/admin', csrfProtect, adminRoutes);

// Serve static frontend files in production
if (isProduction()) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(
    express.static(publicPath, {
      etag: true,
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // Serve index.html for all non-API routes (SPA routing)
  // Ensure we don't swallow unknown /api/* routes
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
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
  const shutdown = async (signal: string) => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server?.close(async () => {
      // Close DB and session resources if available
      try {
        await disconnectDatabase();
      } catch (e) {
        logger.warn({ err: e }, 'Error disconnecting database');
      }
      try {
        // sessionClose is managed by setupMiddleware if needed
      } catch (e) {
        logger.warn({ err: e }, 'Error closing session store');
      }
      logger.info('Server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
