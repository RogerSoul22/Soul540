# Regras de negócio — ChecklistEnvio

**Portal:** `franchise`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Controlar a preparação operacional de um evento ou pedido antes do envio/execução.

## Acesso e atores

A franquia acessa somente os dados da própria unidade e não pode escolher outra unidade pela requisição.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Cada checklist pertence a um contexto operacional e deve identificar o evento ou pedido relacionado.
2. Itens devem registrar estado concluído, responsável e, quando necessário, observação.
3. O progresso deve ser calculado a partir dos itens persistidos, não apenas do estado visual.
4. Itens obrigatórios pendentes devem impedir a conclusão operacional quando essa regra estiver habilitada.
5. Reabertura de item concluído deve manter histórico ou auditoria.

## Efeitos e integrações

- Pode alimentar o dashboard operacional.
- Pode bloquear ou liberar a preparação para produção/envio.

## Pendências de negócio

- Definir lista oficial de itens obrigatórios.
- Definir se checklist concluído altera o status do evento ou pedido.
- Definir prazo e alertas de atraso.

