export function getFranchiseSlug(pathname = typeof window === 'undefined' ? '/' : window.location.pathname): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'campinas') return 'campinas';
  if (parts[0] === 'franquias' && parts[1]) return parts[1];
  return 'campinas';
}

export function getFranchiseBasePath(
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
  port = typeof window === 'undefined' ? '' : window.location.port,
): string {
  const isKnownFranchisePath =
    pathname === '/campinas' || pathname.startsWith('/campinas/') || pathname.startsWith('/franquias/');
  if ((port === '5174' || port === '8082') && !isKnownFranchisePath) return '';

  const slug = getFranchiseSlug(pathname);
  return slug === 'campinas' ? '/campinas' : `/franquias/${slug}`;
}
