function resolveUnit(req: any): string {
  const xSystem = req.headers?.['x-system'];
  if (xSystem === 'franchise' || xSystem === 'factory') return xSystem;
  const userUnit = req.user?.unit;
  if (userUnit && userUnit !== 'main') return userUnit;
  return 'main';
}

export function getTenantFilter(req: any): Record<string, string> {
  const unit = resolveUnit(req);
  if (unit === 'main') return {};
  return { unit };
}

export function getTenantUnit(req: any): string {
  return resolveUnit(req);
}
