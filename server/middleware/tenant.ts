export function getTenantFilter(req: any): Record<string, string> {
  const unit = req.user?.unit;
  if (!unit || unit === 'main') return {};
  return { unit };
}

export function getTenantUnit(req: any): string {
  return req.user?.unit || 'main';
}
