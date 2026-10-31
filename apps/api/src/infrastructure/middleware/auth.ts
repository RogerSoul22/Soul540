import jwt from 'jsonwebtoken';
import { UserModel } from '../../modules/identity/auth.routes';
import { canAccessSystem, normalizeSystem } from '../../modules/identity/auth-system-policy';
import { getJwtSecret } from '../security/jwt-secret';

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
    const payload = jwt.verify(token, getJwtSecret()) as any;
    return await UserModel.findOne({ _id: payload.userId, deletedAt: { $exists: false } }).lean();
  } catch {
    return null;
  }
}

export async function authMiddleware(req: any, res: any, next: any) {
  const user = (await findAuthenticatedUser(req)) as any;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (!canAccessSystem(user, normalizeSystem(req.headers['x-system']))) {
    return res.status(403).json({ error: 'Acesso não permitido neste sistema' });
  }
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
