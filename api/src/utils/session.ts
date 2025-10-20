import session, { SessionOptions } from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { config, isProduction } from '../config/env';

type CloseFn = () => Promise<void> | void;

/**
 * Create and return a session middleware plus an optional close function
 * that will release resources (for example, ending a PG pool).
 *
 * In `test` or when DB URL is not configured, this uses the default
 * MemoryStore from `express-session` so tests don't require Postgres.
 */
export function createSessionMiddleware(): { middleware: ReturnType<typeof session>; close?: CloseFn } {
  // If there's no database URL or we're running in test, prefer MemoryStore
  if (!config.database.url || process.env.NODE_ENV === 'test') {
    const opts: SessionOptions = {
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      name: 'sid',
      cookie: {
        secure: isProduction(),
        httpOnly: true,
        maxAge: config.session.maxAge,
        sameSite: 'lax',
      },
    };

    return { middleware: session(opts) };
  }

  // Production / dev with Postgres-backed sessions
  const PgSession = connectPgSimple(session);
  const pgPool = new pg.Pool({ connectionString: config.database.url });

  const opts: SessionOptions = {
    store: new PgSession({ pool: pgPool, tableName: 'Session', createTableIfMissing: false }) as any,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
      secure: isProduction(),
      httpOnly: true,
      maxAge: config.session.maxAge,
      sameSite: 'lax',
    },
  };

  return {
    middleware: session(opts),
    close: async () => {
      await pgPool.end();
    },
  };
}
