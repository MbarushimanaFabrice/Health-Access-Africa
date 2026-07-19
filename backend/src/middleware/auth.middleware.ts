import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { errorResponse } from '../utils/apiResponse.util';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'No token provided. Authorization required.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword,
    };

    next();
  } catch {
    errorResponse(res, 'Invalid or expired token.', 401);
  }
}
