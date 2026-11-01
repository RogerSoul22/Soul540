# Regras de negócio — NotasFiscais

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Preparar, emitir, acompanhar e consultar documentos fiscais relacionados à operação.

## Acesso e atores

A emissão deve usar a inscrição/configuração fiscal da unidade responsável pelo documento.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Emissão exige CPF/CNPJ do cliente.
2. NF-e exige item, NCM, CFOP e endereço completo.
3. Certificado válido é obrigatório para NF-e; vencimento próximo deve gerar alerta.
4. NFS-e exige identificador de pagamento Asaas quando essa integração for usada.
5. Em processamento, autorizada, rejeitada e cancelada são estados distintos.
6. Nota autorizada não deve ser editada ou excluída fisicamente.
7. Cancelamento, correção e inutilização devem ser comandos fiscais próprios e auditados.
8. XML, número, chave e protocolo devem ser preservados após autorização.

## Efeitos e integrações

- Usa dados de contratante, evento, itens e valores.
- Integra com SEFAZ e Asaas.
- Pode refletir erro de emissão no histórico fiscal.

## Pendências de negócio

- Definir cancelamento e carta de correção.
- Definir prazo fiscal e permissões de emissão.
- Definir tratamento de notas rejeitadas e inutilização.
