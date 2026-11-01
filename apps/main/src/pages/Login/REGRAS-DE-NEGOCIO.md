# Regras de negócio — Login

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Autenticar o usuário e direcioná-lo para o portal correspondente à sua unidade.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A página é pública apenas para autenticação; o restante do portal exige sessão válida.

## Regras da página

1. E-mail deve ser normalizado antes da busca.
2. Senha deve ser verificada contra hash, sem exposição do valor original.
3. Usuário não administrador só pode acessar o sistema da própria unidade.
4. Administrador pode acessar contextos autorizados.
5. Sessão usa token protegido por cookie HTTP-only ou Bearer.
6. Falha de autenticação não deve revelar se o e-mail existe.
7. Logout deve invalidar a sessão/cookie disponível.

## Efeitos e integrações

- Estabelece identidade, permissões e tenant para todas as páginas.
- Direciona para matriz, franquia ou fábrica.

## Pendências de negócio

- Definir recuperação de senha.
- Definir expiração e revogação de sessões.
- Definir MFA e política de bloqueio por tentativas.
