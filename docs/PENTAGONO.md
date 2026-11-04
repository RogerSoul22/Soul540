# Pentágono — design system da Soul540

Pacote `packages/pentagono`, independente dos portais, consumido por Principal, Franquia e Fábrica. Segue o desenho do Pentágono do dVolt, adaptado ao visual e às variáveis de tema da Soul540 (escuro/claro, acento âmbar).

## Como usar

```tsx
import { Button, Modal, SkeletonContent } from '../../../../../packages/pentagono/src/index';
```

- Importe **somente pelo índice** (`.../pentagono/src/index`). Importar de `components/*` é barrado por teste.
- Cada portal carrega os estilos uma vez em `src/main.tsx`: `import '../../../packages/pentagono/src/styles/pentagono.css';` (antes do `global.scss`).
- O repositório proíbe imports `@soul540/*`; por isso o caminho é relativo.

## Estrutura

```text
packages/pentagono/src/
  index.ts                API pública
  breakpoints.ts          BREAKPOINTS (mobile 768, tablet 1024, desktop 1280)
  accessibility/          VisuallyHidden
  styles/
    tokens.css            tokens --pentagono-*
    data-skeleton.css     [data-skeleton] global
    pentagono.css         entrada única (tokens + skeleton + reduced motion)
  components/<Nome>/
    <Nome>.tsx
    <Nome>.module.css     CSS Modules puro, sem Sass
    type.ts               props e tipos
```

## Tokens (duas camadas)

1. **Tema dos portais** (`--bg-primary`, `--text-primary`, `--border`…): definido em cada `global.scss` por `html[data-theme='dark'|'light']`. Continua sendo a fonte do tema.
2. **`--pentagono-*`**: único contrato lido pelos componentes. Cada token lê a variável de tema com fallback no tema escuro (`var(--bg-primary, #0a0f1e)`), então o Pentágono funciona isolado e acompanha o tema.

Grupos: `color-*` (background, surface, text, brand, danger, success, info, border), `space-1..7` (4 a 64px), `radius-*`, `text-*`, `font-*`, `shadow-*`, `transition-*`, `z-modal`. O tema claro sobrescreve só o que depende dele (hover, overlay, sombras).

Media queries não aceitam variáveis CSS; os componentes usam `768px` com comentário apontando para `BREAKPOINTS.mobile`.

## Componentes

| Componente                              | Variações (`variant`)                                                                                          | Observação                                                                                                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button                                  | `primary` `secondary` `ghost` `danger` (com `size` `md/sm/icon`); `chip` `tab` `nav` `outline` `dashed` `link` | `active`, `loading`, `fullWidth`; `aria-pressed`/`aria-current`, `ref`                                                                                                            |
| Input                                   | `default` `search` `inline` `file`                                                                             | com `label`: campo completo, ícone, senha; sem `label`: só o `<input>`; checkbox/radio ganham estilo de escolha; `clearable` (padrão desligado): X para limpar campos de texto com conteúdo |
| Select                                  | `default` `compact` `inline`                                                                                   | com `label` ganha invólucro; sem `label` é só o `<select>`                                                                                                                        |
| DatePicker                              | `date` `month` (tipo do `Input`)                                                                               | `<Input type="date">` e `type="month"` abrem o calendário próprio; `min`/`max`, Hoje e Limpar, setas do teclado                                                                   |
| Textarea, Label                         | `default`                                                                                                      | sem `label` é só o `<textarea>`                                                                                                                                                   |
| Table (+Head/Body/Row/HeadCell/Cell)    | `scroll` `compact` `plain` (na `Table`)                                                                        | `plain` não cria invólucro de rolagem; `interactive` na linha                                                                                                                     |
| Modal                                   | `size` `sm/md/lg`, `maxWidth`, `flush`                                                                         | `role="dialog"`, `aria-modal`, fecha com Esc                                                                                                                                      |
| ConfirmModal                            | -                                                                                                              | `role="alertdialog"`, fecha com Esc                                                                                                                                               |
| DocumentViewer                          | `fullscreen` `panel`                                                                                           | documento em papel com barra de ferramentas, ou painel escuro sobre fundo desfocado; fecha com Esc                                                                                |
| Backdrop                                | -                                                                                                              | camada invisível que fecha popovers ao clicar fora                                                                                                                                |
| PageHeader                              | `default` `greeting`                                                                                           | `eyebrow`, `titleExtra`, `notice`, `actions`                                                                                                                                      |
| Heading                                 | `page` `display` `section`                                                                                     | níveis 1 a 6                                                                                                                                                                      |
| Card                                    | `default` `stat` `flat` `outlined`                                                                             | `interactive`                                                                                                                                                                     |
| Checkbox                                | `checkbox` `switch` `card`                                                                                     | `description`; `role="switch"` no interruptor                                                                                                                                     |
| EmptyState                              | `default` `compact` `inline`                                                                                   | `icon`, `description`, `action`, `children`                                                                                                                                       |
| Badge                                   | `blue` `green` `amber` `red` `gray` `purple`                                                                   |                                                                                                                                                                                   |
| Spinner, SkeletonContent, SkeletonValue | -                                                                                                              | padrão `data-skeleton` do dVolt                                                                                                                                                   |

Ficam em `packages/ui` (específicos da Soul540, equivalentes aos "compostos" do dVolt): `GaugeChart`, `HorizontalBarChart`, `Logo`, `PortalLayout`, `ApiFeedback`, `ErrorBoundary` e o `ThemeProvider`.

## data-skeleton

- `[data-skeleton]` (≠ `"false"`) mantém o tamanho do conteúdo final, esconde os filhos, anima o brilho e respeita `prefers-reduced-motion`.
- `SkeletonContent` (`page | cards | table | list`) ocupa uma área inteira; `SkeletonValue` cobre um valor isolado.
- Só para **carregamento de dados da API**. Botões em `loading`, submits e autenticação continuam com `Button loading` / `Spinner`.
- Os três portais expõem `useApp().dataLoading` (eventos, tarefas e finanças), usado em Dashboard, Financeiro, Eventos e Tarefas.

## Estado da adoção

Nenhuma tela usa `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>` nem `<h1>`…`<h6>` puros, e nenhuma tela desenha overlay próprio: os testes `pentagono.structure.test.ts` e `pentagono.variants.test.ts` barram a volta. Não existe mais o modo `bare`: todo elemento é um componente com `variant`.

As variações trazem o padrão visual, mas os estilos ficam em `@layer pentagono`: a `className` da página continua vencendo onde ela já definia o visual. Para apagar o CSS de uma tela, troque por uma variação e remova a classe.

- Botões de filtro, aba, menu lateral, navegação do calendário, paginação, adicionar item e remover usam `chip`, `tab`, `nav`, `outline`, `dashed`, `danger`.
- Campos de busca usam `Input variant="search"`; células editáveis, `inline`; selects de filtro, `compact`.
- Contrato e cardápio abrem em `DocumentViewer`; o seletor de data do calendário fecha por `Backdrop`.
- Cabeçalhos: saudação do Dashboard (`greeting`), Permissões (`notice`), Minha conta; títulos de login e erro usam `Heading variant="display"`.
- Cartões das telas são `Card`; estados vazios (inclusive os de Eventos e Despesas) são `EmptyState`.
- Os tokens SCSS (`_variables.scss`, `_mixins.scss`) têm fonte única em `packages/pentagono/src/styles`; cada portal só os reexporta.

## Regras

- Componente genérico → `pentagono`. Componente com regra de negócio ou layout do produto → `packages/ui` ou `packages/screens`.
- Estilo só com `var(--pentagono-*)`; sem Sass nos componentes (só `styles/_variables.scss` e `_mixins.scss`, para as telas) e sem cor hexadecimal fora dos tokens (exceção: matizes de `Badge`).
- Props em `type.ts`; arquivo com no máximo 170 linhas.
- Toda mudança de componente do Pentágono vale para os três portais ao mesmo tempo.
