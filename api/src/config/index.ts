import { z } from 'zod';
import pino from 'pino';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

// Environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.string().default('86400000'), // 24 hours in ms
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

const env = validateEnv();

// Type guard helpers
export const isDevelopment = () => config.env === 'development';
export const isProduction = () => config.env === 'production';
export const isTest = () => config.env === 'test';

// Logger configuration
export const logger = pino({
  level: env.LOG_LEVEL,
  transport: isDevelopment()
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.email',
    ],
    remove: true,
  },
});

// Rate limit configuration
const rateLimitConfig = {
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
};

// Combined configuration object
export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: env.DATABASE_URL,
  },
  session: {
    secret: env.SESSION_SECRET,
    maxAge: parseInt(env.SESSION_MAX_AGE, 10),
    cookie: {
      secure: isProduction(),
      sameSite: 'lax' as const,
      httpOnly: true,
    },
  },
  jwt: {
    secret: env.JWT_SECRET ?? env.SESSION_SECRET,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
  logging: {
    level: env.LOG_LEVEL,
    prettyPrint: isDevelopment(),
  },
  rateLimit: {
    ...rateLimitConfig,
    auth: {
      ...rateLimitConfig,
      max: Math.floor(rateLimitConfig.max * 0.1), // 10% of base limit
    },
    submission: {
      ...rateLimitConfig,
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
    },
  },
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
} as const;
