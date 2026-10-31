import type { TenantUnit } from '../../infrastructure/franchise-context';

type UserLike = { isAdmin?: boolean; unit?: TenantUnit; franchiseId?: string };

export function normalizeSystem(value: unknown): TenantUnit {
  return value === 'franchise' || value === 'factory' ? value : 'main';
}

export function isGlobalAdmin(user?: UserLike | null): boolean {
  return Boolean(user?.isAdmin) && (user?.unit || 'main') === 'main';
}

export function canAccessSystem(user: UserLike | null | undefined, requestedSystem: TenantUnit): boolean {
  if (!user) return false;
  if (isGlobalAdmin(user)) return requestedSystem === 'main' || requestedSystem === 'factory';
  return (user.unit || 'main') === requestedSystem;
}
