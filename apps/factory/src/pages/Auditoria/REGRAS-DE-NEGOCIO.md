# Regras de negócio — Auditoria

**Portal:** `factory`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Permitir consulta do histórico de ações relevantes do sistema, preservando rastreabilidade sem oferecer edição dos registros.

## Acesso e atores

A fábrica acessa somente os dados operacionais da própria unidade; alterações comerciais ou financeiras fora do escopo da fábrica são bloqueadas.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Listar registros por data, usuário, ação, entidade e unidade efetiva.
2. Aplicar isolamento de tenant para usuários não autorizados e escopo consolidado somente para quem possuir essa permissão.
3. Registros de auditoria são imutáveis: não podem ser editados nem excluídos pela página.
4. Cancelamentos, reversões, reaberturas, alterações de permissão, emissão fiscal e movimentações de estoque devem aparecer no histórico.

## Efeitos e integrações

- Consulta as rotas de auditoria da API.
- Pode abrir o detalhe da ação, mas não deve executar novamente a operação.

## Pendências de negócio

- Definir retenção e arquivamento dos registros.
- Definir se dados sensíveis devem ser mascarados na visualização.
