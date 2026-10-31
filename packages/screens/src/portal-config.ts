export type PortalId = 'main' | 'factory' | 'franchise';

export interface PortalConfig {
  basePath: string;
  id: PortalId;
  unit: 'main' | 'factory' | 'franchise';
}

export const portalConfigs = {
  main: { id: 'main', unit: 'main', basePath: '/' },
  factory: { id: 'factory', unit: 'factory', basePath: '/fabrica' },
  franchise: { id: 'franchise', unit: 'franchise', basePath: '/itu' },
} as const satisfies Record<PortalId, PortalConfig>;

export function getFranchisePortalPath(slug: string): string {
  return slug === 'itu' ? '/itu' : `/franquias/${slug}`;
}
