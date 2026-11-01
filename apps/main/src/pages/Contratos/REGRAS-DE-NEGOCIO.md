# Regras de negócio — Contratos

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Formalizar a contratação de um evento, seus valores, serviços, condições de pagamento e responsabilidades.

## Acesso e atores

A matriz pode consultar contratos de todas as unidades conforme permissão e deve preservar o tenant do documento.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Novo contrato começa como rascunho.
2. Contrato deve estar associado a contratante e, quando aplicável, a um evento.
3. Valores, quantidade de convidados, extras, bebidas, condições de pagamento e termos devem ser validados antes da aprovação.
4. Contrato aprovado/assinado deve preservar a versão dos dados comerciais e do cardápio utilizados.
5. Alterações após aprovação devem gerar nova versão ou aditivo, nunca sobrescrever o documento histórico.
6. Cancelamento deve respeitar prazo, multa e política do evento.

## Efeitos e integrações

- Pode sincronizar valor contratado, sinal e saldo com o financeiro.
- Pode fornecer dados para geração de documento e assinatura.
- Pode alterar a elegibilidade operacional do evento após aprovação.

## Pendências de negócio

- Definir estados oficiais e transições.
- Definir assinatura e validade jurídica.
- Definir cálculo de multa, aditivo e efeito do cancelamento.
