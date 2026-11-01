export interface ManifestInput {
  // Identidade do app instalado: única por portal (e por franquia).
  id: string;
  name: string;
  shortName: string;
  description: string;
  // Caminhos que o app instalado controla, ex.: '/', '/fabrica/', '/franquias/sorocaba/'.
  scope: string;
  startUrl: string;
  themeColor?: string;
  backgroundColor?: string;
  // Prefixo dos ícones, com barra final, ex.: '/fabrica/icons/'.
  iconBase: string;
}

export const MANIFEST_ICONS = [
  { file: 'icon-192.png', sizes: '192x192', purpose: 'any' },
  { file: 'icon-512.png', sizes: '512x512', purpose: 'any' },
  { file: 'icon-maskable-512.png', sizes: '512x512', purpose: 'maskable' },
];

// Usado pelo plugin do Vite (manifesto estático) e no navegador (manifesto de cada franquia).
export function buildManifest(input: ManifestInput) {
  return {
    id: input.id,
    name: input.name,
    short_name: input.shortName,
    description: input.description,
    lang: 'pt-BR',
    start_url: input.startUrl,
    scope: input.scope,
    display: 'standalone',
    orientation: 'any',
    theme_color: input.themeColor ?? '#0a0f1e',
    background_color: input.backgroundColor ?? '#0a0f1e',
    icons: MANIFEST_ICONS.map(({ file, sizes, purpose }) => ({
      src: `${input.iconBase}${file}`,
      sizes,
      type: 'image/png',
      purpose,
    })),
  };
}
