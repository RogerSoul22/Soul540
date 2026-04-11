import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../routes/auth';

export async function authMiddleware(req: any, res: any, next: any) {
  // Try httpOnly cookie first
  let token: string | undefined = req.cookies?.soul540_token;
  // Fallback to Authorization header (backward compat)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
  }
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'soul540-secret') as any;
    const user = await UserModel.findById(payload.userId).lean();
    if (user) (req as any).user = user;
  } catch {
    // invalid/expired token — continue without user
  }
  next();
}

export const optionalAuth = authMiddleware;
