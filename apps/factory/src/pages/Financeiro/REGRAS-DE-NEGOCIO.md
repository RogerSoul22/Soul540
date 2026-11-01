# Regras de negócio — Financeiro

**Portal:** `factory`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Registrar, consultar, liquidar e analisar receitas, custos, previsões e movimentos importados.

## Acesso e atores

O financeiro da fábrica deve refletir produção e operações próprias; não deve reescrever o financeiro comercial do evento.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Lançamento deve possuir tipo, categoria, descrição, valor e data válidos.
2. Estados canônicos são aberto, parcial, liquidado e cancelado.
3. Liquidação parcial ou total deve ser feita por comando, com idempotência.
4. Uma liquidação não pode exceder o saldo restante.
5. Caixa usa a data da liquidação; competência usa a data do lançamento/evento/vencimento aplicável.
6. Lançamentos cancelados ou revertidos não entram nos totais.
7. Lançamentos automáticos de evento, comissão e produção não podem ser editados como se fossem manuais.
8. Importação OFX não pode duplicar transações e deve preservar a origem bancária.
9. Fechamento financeiro do evento não é o mesmo que lançamento liquidado.

## Efeitos e integrações

- Recebe sincronização de eventos e ordens.
- Alimenta DRE, resumo de caixa, gráficos, exportações e dashboard.
- Pode iniciar recorrências e importações OFX/XML.

## Pendências de negócio

- Definir sinal recebido versus previsão.
- Definir reabertura após fechamento.
- Definir política de ajustes de valores já liquidados.
