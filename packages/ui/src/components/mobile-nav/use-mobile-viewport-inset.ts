import { useEffect } from 'react';

// Quanto a barra do navegador cobre da parte de baixo da tela (celular). A barra de navegação do portal sobe
// essa altura para não ficar escondida atrás dela.
export function useMobileViewportInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const update = () => {
      const inset = Math.max(0, Math.round(root.clientHeight - viewport.height - viewport.offsetTop));
      root.style.setProperty('--mobile-browser-bottom-inset', `${inset}px`);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty('--mobile-browser-bottom-inset');
    };
  }, []);
}
