export function getFactoryBasePath(
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
  port = typeof window === 'undefined' ? '' : window.location.port,
): string {
  const isPrefixedPath = pathname === '/fabrica' || pathname.startsWith('/fabrica/');
  if (isPrefixedPath) return '/fabrica';
  if (port === '5175' || port === '8081') return '';
  return '/fabrica';
}
