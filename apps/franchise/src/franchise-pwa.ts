import { applyDynamicManifest } from '../../../packages/pwa/src/apply-dynamic-manifest';
import { registerServiceWorker } from '../../../packages/pwa/src/register-service-worker';
import { getFranchiseBasePath, getFranchiseSlug } from './franchise-path';

// "sao-paulo" -> "Sao Paulo"
export function franchiseTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Cada franquia (/campinas, /franquias/<slug>) é um app instalável próprio, com id, nome e escopo distintos.
// O Campinas usa o manifesto estático do build; as demais recebem um manifesto gerado a partir do slug.
export function setupFranchisePwa() {
  const basePath = getFranchiseBasePath();
  if (!basePath) return;

  const scope = `${basePath}/`;
  const slug = getFranchiseSlug();
  const baseUrl = import.meta.env.BASE_URL;

  registerServiceWorker({ swUrl: `${baseUrl}sw.js`, scope });

  if (slug === 'campinas') return;
  const title = franchiseTitle(slug);
  applyDynamicManifest({
    id: scope,
    name: `Soul540 Franquia ${title}`,
    shortName: title.slice(0, 12),
    description: `Gestão da franquia ${title} da Soul540.`,
    scope,
    startUrl: scope,
    iconBase: `${baseUrl}icons/`,
  });
}
