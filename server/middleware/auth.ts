import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../routes/auth';

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.replace('Bearer ', '');
  // token format: "token-{userId}-{timestamp}"
  const parts = token.split('-');
  if (parts.length < 2) return next();

  const userId = parts[1];
  try {
    const user = await UserModel.findById(userId).lean();
    if (user) (req as any).user = user;
  } catch {
    // invalid token — ignore
  }
  next();
}
