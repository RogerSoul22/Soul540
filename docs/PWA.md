# PWA dos portais

Cada portal é um app instalável independente, com nome, identidade e escopo próprios.

| Portal    | Nome instalado   | `id` e escopo                | Service worker                                              |
| --------- | ---------------- | ---------------------------- | ----------------------------------------------------------- |
| Principal | Soul540          | `/` (abre em `/portal.html`) | `/sw.js`                                                    |
| Fábrica   | Soul540 Fábrica  | `/fabrica/`                  | `/fabrica/sw.js`                                            |
| Franquia  | Soul540 Franquia | `/campinas/`                      | `/franchise-assets/sw.js` (com `Service-Worker-Allowed: /`) |

## Como funciona

- `packages/pwa/src/soul-pwa-plugin.ts` é um plugin do Vite usado em cada `vite.config.ts`. Ele gera o `manifest.webmanifest`, copia o `sw.js` e os ícones (sempre sob o `base` do app) e injeta no `index.html` o link do manifesto, `theme-color` e o ícone do iOS. Funciona em desenvolvimento e no build.
- `packages/pwa/assets/service-worker.js` é um único arquivo para os três portais. Cada portal o registra no próprio escopo, e o cache de cada escopo é separado (`soul540-v1-<escopo>`).
- `packages/pwa/src/register-service-worker.ts` registra o service worker **só em produção** (em desenvolvimento o cache atrapalharia o hot reload). Cada `main.tsx` chama com o escopo do portal.
- Os ícones ficam em `packages/pwa/assets/icons` (192, 512, maskable e iOS), gerados a partir de `apps/main/public/logo.png`.

## Uma PWA por franquia

O build da franquia é um só, mas cada caminho vira um app instalável próprio:

- `/campinas/` usa o manifesto estático do build (`id` `/campinas/`).
- `/franquias/<slug>/` recebe, no navegador, um manifesto gerado a partir do slug (`apps/franchise/src/franchise-pwa.ts`): `id` e escopo `/franquias/<slug>/`, nome "Soul540 Franquia <Slug>". O manifesto sai de `buildManifest`, o mesmo construtor do plugin, e é aplicado por `applyDynamicManifest` como um `blob:` com caminhos absolutos.
- O service worker é o mesmo de `/franchise-assets/sw.js`, registrado no escopo de cada franquia.
- Instalar duas franquias no mesmo aparelho cria dois apps separados, cada um com cache próprio.

## Funcionamento offline

Duas camadas trabalham juntas:

1. **Service worker** (`packages/pwa/assets/service-worker.js`): guarda a tela do portal. Na instalação ele baixa todos os scripts, estilos e fontes do build (o plugin injeta a lista), então qualquer tela abre sem rede, inclusive as que o usuário nunca visitou. Cada build usa um cache novo e apaga o anterior.
2. **Camada offline do `apiFetch`** (`packages/api-client/src/offline/`): guarda os **dados** no IndexedDB do aparelho.
   - **Leitura:** toda consulta (`GET /api/...`) que dá certo é guardada. Se a rede cair, a tela recebe a última resposta guardada. A cópia é separada por sistema e franquia (`X-System`, `X-Franchise-Id`). A sessão (`/api/auth/me`) também é guardada, então o portal abre sem pedir login de novo.
   - **Escrita:** criar, editar ou excluir sem conexão entra numa fila. A tela recebe uma resposta provisória (id `offline-…`) e a lista guardada já mostra a alteração. Ao voltar a conexão a fila é enviada em ordem; ids provisórios são trocados pelos reais nas alterações seguintes.
   - **Recusas:** se o servidor recusar uma alteração (dado inválido, sem permissão), ela vai para "não aceitas", com o motivo, e o usuário pode tentar de novo ou descartar. Falta de conexão ou erro 5xx mantém a fila; erro 401 pausa o envio até entrar de novo.
   - **Aviso na tela:** `OfflineBanner` (em `PortalLayout`) mostra "Sem conexão", quantas alterações aguardam envio, "Enviar agora" e as alterações não aceitas. Depois de enviar, a página recarrega para buscar os dados gravados.
   - **Privacidade:** entrar e sair apagam tudo o que foi guardado (dados e fila), então não sobra nada do usuário anterior no aparelho.
   - **Fora do offline:** login, nota fiscal e certificado (`/api/fiscal`), chat com IA, exportações, importações (XML/OFX) e envio de arquivos dependem do servidor e continuam exigindo conexão. Alterações só entram na fila quando o aparelho está sem conexão (`navigator.onLine === false`); se estiver conectado mas o servidor falhar, o erro aparece como antes, para não duplicar registros.

## Cache do service worker

- `/api` nunca passa pelo cache: dados e login vêm sempre da rede.
- Páginas: rede primeiro; sem conexão, abre o último portal guardado, ou uma tela "Sem conexão" com botão para tentar de novo.
- Scripts, estilos, fontes e imagens: usa o cache e atualiza em segundo plano.
- O Principal não intercepta as páginas dos outros portais (`/fabrica`, `/campinas`, `/franquias`, `/franchise-assets`).
- Arquivos (`portal.html`, planilhas) vão direto para a rede.

## Limites conhecidos

- Os ícones vêm da logo de 150 px ampliada; para um ícone nítido, troque `logo.png` por uma versão de 512 px e rode a geração de ícones.
- Para testar a instalação, use o build de produção (`pnpm build` e servir o `dist`), não o servidor de desenvolvimento.
