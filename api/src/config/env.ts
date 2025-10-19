import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenvConfig();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.string().default('86400000'), // 24 hours in ms
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const env = validateEnv();

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: env.DATABASE_URL,
  },
  session: {
    secret: env.SESSION_SECRET,
    maxAge: parseInt(env.SESSION_MAX_AGE, 10),
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
} as const;

// Helper getters for environment checks
export const isDevelopment = () => config.env === 'development';
export const isProduction = () => config.env === 'production';
export const isTest = () => config.env === 'test';
