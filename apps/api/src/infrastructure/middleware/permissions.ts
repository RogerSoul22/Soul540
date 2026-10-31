import { isGlobalAdmin } from '../../modules/identity/auth-system-policy';

export type PermissionMode = 'read' | 'write';

type PermissionUser = {
  isAdmin?: boolean;
  unit?: 'main' | 'franchise' | 'factory';
  permissions?: string[];
};

export function hasPermission(
  user: PermissionUser | null | undefined,
  permission: string,
  mode: PermissionMode = 'read',
): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  const permissions = new Set(user.permissions || []);
  if (permissions.has(permission)) return true;
  if (permissions.has(`${permission}:${mode}`)) return true;
  return mode === 'read' && permissions.has(`${permission}:write`);
}

export function requirePermission(permission: string, mode: PermissionMode = 'read') {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'authentication_required' });
    if (!hasPermission(req.user, permission, mode)) {
      return res.status(403).json({ error: 'permission_denied', permission, mode });
    }
    next();
  };
}

export function requireGlobalAdmin(req: any, res: any, next: any) {
  if (!isGlobalAdmin(req.user)) return res.status(403).json({ error: 'global_admin_required' });
  next();
}
