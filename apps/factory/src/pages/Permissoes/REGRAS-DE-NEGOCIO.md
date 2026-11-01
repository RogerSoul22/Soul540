# Regras de negócio — Permissoes

**Portal:** `factory`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Administrar o acesso individual dos usuários às páginas e ações do sistema.

## Acesso e atores

A fábrica acessa somente os dados operacionais da própria unidade; alterações comerciais ou financeiras fora do escopo da fábrica são bloqueadas.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Somente administrador pode gerenciar permissões.
2. Permissões de página controlam navegação e acesso inicial.
3. Ações sensíveis também devem ser protegidas no backend, não apenas ocultadas no menu.
4. Usuário não pode conceder a si mesmo uma permissão superior.
5. Alterações de permissões devem registrar usuário executor, alvo e conjunto anterior/novo.
6. Permissões devem respeitar a unidade do usuário.

## Efeitos e integrações

- Controla menus, guards de rota e autorização de comandos.
- Afeta financeiro, fiscal, eventos, estoque, auditoria e chat.

## Pendências de negócio

- Definir catálogo oficial de páginas.
- Definir catálogo de ações.
- Definir regra para administrador e revogação imediata.
