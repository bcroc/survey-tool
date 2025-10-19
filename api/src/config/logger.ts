import pino from 'pino';
import type { Logger } from 'pino';
import { isDevelopment, isProduction } from './env';

export const logger: Logger = pino({
  level: isProduction() ? 'info' : 'debug',
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
