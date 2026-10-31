import mongoose from 'mongoose';

export type TenantUnit = 'main' | 'franchise' | 'factory';

export interface FranchiseScope {
  unit: TenantUnit;
  franchiseId?: string;
  isAdmin: boolean;
}

interface RequestLike {
  user?: { unit?: TenantUnit; franchiseId?: string; isAdmin?: boolean };
  headers?: Record<string, string | string[] | undefined>;
}

function headerValue(req: RequestLike, name: string): string | undefined {
  const value = req.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function validateFranchiseId(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (!mongoose.isValidObjectId(value)) throw new Error('Invalid franchise scope');
  return value;
}

export function getFranchiseScope(req: RequestLike): FranchiseScope {
  const user = req.user;
  const isAdmin = Boolean(user?.isAdmin);
  const userUnit = user?.unit;

  if (user && !isAdmin) {
    return {
      unit: userUnit || 'main',
      ...(userUnit === 'franchise' && { franchiseId: validateFranchiseId(user.franchiseId) }),
      isAdmin: false,
    };
  }

  if (userUnit === 'franchise' && user?.franchiseId) {
    return { unit: 'franchise', franchiseId: validateFranchiseId(user.franchiseId), isAdmin };
  }

  const requestedUnit = headerValue(req, 'x-system');
  const unit: TenantUnit =
    requestedUnit === 'franchise' || requestedUnit === 'factory' ? requestedUnit : userUnit || 'main';
  const requestedFranchiseId = headerValue(req, 'x-franchise-id');

  return {
    unit,
    ...(unit === 'franchise' && {
      franchiseId: validateFranchiseId(requestedFranchiseId),
    }),
    isAdmin,
  };
}

export function requireFranchiseId(req: RequestLike): string {
  const scope = getFranchiseScope(req);
  if (scope.unit !== 'franchise' || !scope.franchiseId) {
    throw new Error('Franchise scope required');
  }
  return scope.franchiseId;
}

export function getRequestedFranchiseId(req: RequestLike): string | undefined {
  return validateFranchiseId(headerValue(req, 'x-franchise-id'));
}
