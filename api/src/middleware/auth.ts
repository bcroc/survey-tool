import { mixedAuth } from './mixedAuth';

// For compatibility keep `requireAuth`/`optionalAuth` API surface but delegate
// to the new `mixedAuth` middleware which accepts session or JWT authentication.
export const requireAuth = mixedAuth;
export const optionalAuth = (_req: any, _res: any, next: any) => next();
