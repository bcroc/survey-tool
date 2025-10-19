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
        req[type] = await schema.parseAsync(req[type]);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          }));
          return sendValidationError(res, `${type.charAt(0).toUpperCase() + type.slice(1)} validation failed`, details);
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
