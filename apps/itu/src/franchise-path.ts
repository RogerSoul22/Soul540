// Franquias com endereço próprio na raiz do domínio (/campinas, /itu). As demais ficam em /franquias/<slug>.
export const TOP_LEVEL_FRANCHISES = ['campinas', 'itu'] as const;

function isTopLevelFranchise(slug: string): boolean {
  return (TOP_LEVEL_FRANCHISES as readonly string[]).includes(slug);
}

export function getFranchiseSlug(pathname = typeof window === 'undefined' ? '/' : window.location.pathname): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isTopLevelFranchise(parts[0])) return parts[0];
  if (parts[0] === 'franquias' && parts[1]) return parts[1];
  return 'itu';
}

export function getFranchiseBasePath(
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
  port = typeof window === 'undefined' ? '' : window.location.port,
): string {
  const first = pathname.split('/').filter(Boolean)[0] || '';
  const isKnownFranchisePath = isTopLevelFranchise(first) || pathname.startsWith('/franquias/');
  if ((port === '5176' || port === '8082') && !isKnownFranchisePath) return '';

  const slug = getFranchiseSlug(pathname);
  return isTopLevelFranchise(slug) ? `/${slug}` : `/franquias/${slug}`;
}
