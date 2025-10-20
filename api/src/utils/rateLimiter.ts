import rateLimit from 'express-rate-limit';

type Options = Parameters<typeof rateLimit>[0];

export function createRateLimiter(opts: Options) {
  return rateLimit(opts);
}

export function publicLimiter() {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });
}

export function submissionLimiter() {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many submissions from this IP, please try again later.',
  });
}
