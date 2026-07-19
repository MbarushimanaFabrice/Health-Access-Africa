import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse.util';

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(
        res,
        `Access denied. Requires role: ${roles.join(' or ')}.`,
        403
      );
      return;
    }

    next();
  };
}
