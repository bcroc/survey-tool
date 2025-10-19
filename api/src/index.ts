import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import pinoHttp from 'pino-http';
import connectPgSimple from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
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

// HTTP logger
app.use(pinoHttp({ logger }));

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
      secure: false, // Set to false to work in non-HTTPS environments
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

// Admin routes (protected)
app.use('/api/admin', adminRoutes);

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
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Determine error message
  const message = isProduction() 
    ? (statusCode === 500 ? 'Internal server error' : err.message)
    : (err.message || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment() && { stack: err.stack }),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Start server
const server = app.listen(config.port, () => {
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
  server.close(async () => {
    await disconnectDatabase();
    await pgPool.end();
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
