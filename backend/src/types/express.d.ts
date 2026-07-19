// Extends Express Request to include `user` from JWT payload
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
      mustChangePassword: boolean;
    };
  }
}
