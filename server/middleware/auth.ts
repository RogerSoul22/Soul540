import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../routes/auth';

export async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'soul540-secret') as any;
    // Still look up user to get fresh data (role, unit might have changed)
    const user = await UserModel.findById(payload.userId).lean();
    if (user) (req as any).user = user;
  } catch {
    // invalid/expired token — just continue without user
  }
  next();
}

// Keep optionalAuth as an alias for backwards compatibility
export const optionalAuth = authMiddleware;
