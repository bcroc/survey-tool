import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendValidationError } from '../utils/response';

type ValidationType = 'body' | 'query' | 'params';

/**
 * Generic validation middleware for body, query, or params
 */
function createValidator(type: ValidationType) {
  return (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = await schema.parseAsync(req[type]);
        // Use Object.defineProperty to handle read-only properties like 'query'
        Object.defineProperty(req, type, {
          value: validated,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          // Zod v4 exposes validation problems via `issues`
          const issues = error.issues ?? [] as unknown[];
          const details = issues.map((issue: unknown) => {
            const e = issue as { path?: unknown; message?: unknown; code?: unknown };
            return {
              path: Array.isArray(e.path) ? e.path.join('.') : String(e.path ?? ''),
              message: String(e.message ?? 'Invalid input'),
              code: String(e.code ?? ''),
            };
          });
          return sendValidationError(
            res,
            `${type.charAt(0).toUpperCase() + type.slice(1)} validation failed`,
            details
          );
        }
        next(error);
      }
    };
  };
}

/**
 * Validate request body against Zod schema
 */
export const validate = createValidator('body');

/**
 * Validate request query parameters
 */
export const validateQuery = createValidator('query');

/**
 * Validate request params
 */
export const validateParams = createValidator('params');
