import jwt from 'jsonwebtoken';
import { UserModel } from '../routes/auth';

function readToken(req: any): string | undefined {
  let token: string | undefined = req.cookies?.soul540_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
  }
  return token;
}

async function findAuthenticatedUser(req: any) {
  const token = readToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'soul540-secret') as any;
    return await UserModel.findById(payload.userId).lean();
  } catch {
    return null;
  }
}

export async function authMiddleware(req: any, res: any, next: any) {
  const user = await findAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Administrator access required' });
  next();
}

export async function optionalAuth(req: any, _res: any, next: any) {
  const user = await findAuthenticatedUser(req);
  if (user) req.user = user;
  next();
}
