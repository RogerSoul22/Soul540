# Regras de negócio — Links

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Oferecer uma entrada central para os portais e áreas autorizadas do ecossistema Soul540.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Exibir somente portais disponíveis para o usuário e sua unidade.
2. Não expor links de administração ou fábrica para usuários sem permissão.
3. Acesso pelo link não substitui autenticação nem guard da aplicação de destino.
4. Links devem apontar para rotas oficiais configuradas, sem URLs duplicadas ou hardcoded em múltiplos pontos.

## Efeitos e integrações

- Direciona para matriz, franquia e fábrica.
- Pode ser usado como seletor de contexto após autenticação.

## Pendências de negócio

- Definir quais portais cada perfil pode visualizar.
- Definir se a troca de contexto exige novo login.
