// Backwards-compat shim — re-export the new `requireAuth` as `mixedAuth`.
import { requireAuth } from './auth';

// Preserve the original function name for callers that still import `mixedAuth`.
export const mixedAuth = requireAuth;
