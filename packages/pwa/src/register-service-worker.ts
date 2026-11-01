interface RegisterOptions {
  // Caminho do service worker publicado pelo portal (sempre sob o base do Vite).
  swUrl: string;
  // Escopo controlado pelo portal, ex.: '/', '/fabrica/', '/itu/'.
  scope: string;
}

// Só em produção: em desenvolvimento o cache atrapalharia o hot reload.
export function registerServiceWorker({ swUrl, scope }: RegisterOptions) {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl, { scope }).catch((error) => {
      console.warn('Não foi possível registrar o service worker:', error);
    });
  });
}
