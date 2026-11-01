import { buildManifest, type ManifestInput } from './manifest';

// Troca o manifesto da página por um gerado na hora. Serve quando o mesmo build atende vários apps
// instaláveis (uma franquia por caminho), e cada um precisa de id, nome e escopo próprios.
// Em manifesto "blob:" os caminhos precisam ser absolutos, então todos recebem a origem da página.
export function applyDynamicManifest(input: ManifestInput) {
  const { origin } = window.location;
  const absolute = (path: string) => (path.startsWith('http') ? path : `${origin}${path}`);
  const manifest = buildManifest({
    ...input,
    id: absolute(input.id),
    scope: absolute(input.scope),
    startUrl: absolute(input.startUrl),
    iconBase: absolute(input.iconBase),
  });

  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]') ?? document.createElement('link');
  link.rel = 'manifest';
  link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
  if (!link.isConnected) document.head.appendChild(link);
}
