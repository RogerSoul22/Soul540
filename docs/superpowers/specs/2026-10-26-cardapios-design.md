# Design: Cardápios compacto e operacional

## Contexto

A tela de Cardápios apresenta os menus em cards muito altos, com excesso de espaço vazio, categorias pouco legíveis e ações empilhadas. Isso dificulta a leitura rápida e a operação quando o número de cardápios crescer.

## Objetivo

Reorganizar a tela para que cada menu seja compreendido e operado rapidamente, preservando o tema escuro e a identidade visual atual do Soul540.

## Direção escolhida

Dashboard compacto e operacional.

### Estrutura dos cards padrão

- Cabeçalho com nome do menu, badge de origem e quantidade total de itens.
- Tagline com limite visual de duas linhas.
- Categorias exibidas como linhas/chips identificáveis, com nome e quantidade separados.
- Rodapé com ações alinhadas: `Visualizar` como ação primária, `Editar` como secundária e `PDF` como ação auxiliar.
- Altura definida pelo conteúdo, sem áreas vazias artificiais.

### Estrutura dos cards personalizados

- Mesmo padrão visual dos cards padrão.
- Evento associado como metadado secundário.
- Indicadores de categorias e itens agrupados no cabeçalho.
- Ações alinhadas no rodapé, mantendo `Excluir` visualmente destrutiva e secundária.

### Layout responsivo

- Três colunas em telas largas.
- Duas colunas em telas médias.
- Uma coluna em telas pequenas.
- Ações ocupam a largura disponível no mobile, sem causar overflow.
- Busca permanece acessível no cabeçalho da seção de personalizados e adapta-se para largura total no mobile.

## Fora do escopo

- Alterar o fluxo de criação, edição, visualização ou geração de PDF.
- Alterar o conteúdo dos menus ou regras de negócio.
- Criar uma prévia visual com imagens ou transformar a tela em tabela.
- Fazer mudanças globais no design system.

## Critérios de validação

- Nenhuma ação fica empilhada de forma acidental em desktop.
- Categorias e quantidades ficam visualmente separadas.
- Os cards não apresentam espaço vertical desproporcional.
- A tela permanece utilizável em 320px, 768px e desktop largo.
- O build da aplicação principal e os testes relacionados à página passam.
