import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse.util';

export function requirePasswordChange(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.mustChangePassword) {
    res.status(403).json({
      success: false,
      error: 'You must change your password before continuing.',
      code: 'PASSWORD_CHANGE_REQUIRED',
    });
    return;
  }

  next();
}
