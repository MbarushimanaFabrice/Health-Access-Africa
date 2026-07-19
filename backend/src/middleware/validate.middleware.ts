import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse.util';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        errorResponse(res, `Validation error: ${messages}`, 422);
        return;
      }
      next(error);
    }
  };
}
