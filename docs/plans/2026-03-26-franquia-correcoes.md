# Design: Correções Sistema Franquia

**Data:** 2026-03-26

## 1. Contratos – menuId no formulário + Anexo I dinâmico

**Problema:** A tela existe mas não tem seleção de cardápio (ficou para trás em relação ao principal) e `contratos` não está no `ALL_PAGES` das permissões.

**Solução:**
- `franchise/src/pages/Contratos/Contratos.tsx`: adicionar `menuId` ao `FormData`, `emptyForm`, `openEdit`, `handleSubmit` e campo `<select>` no modal usando `SOUL540_MENUS` local
- `franchise/src/pages/Contratos/ContractDocument.tsx`: adicionar `menuId?` ao tipo `Contract`, importar `SOUL540_MENUS` local e substituir Anexo I estático por IIFE dinâmica (com fallback genérico)
- `franchise/src/pages/Permissoes/Permissoes.tsx`: adicionar `contratos` ao grupo Gestão no `ALL_PAGES`

## 2. Cardápios – apenas permissão faltando

**Problema:** Página existe e funciona, mas `cardapios` não está no `ALL_PAGES` então não pode ser liberada para não-admins.

**Solução:**
- `franchise/src/pages/Permissoes/Permissoes.tsx`: adicionar `cardapios` ao grupo Gestão no `ALL_PAGES`

## 3. Est. Insumos – Card de adicionar

**Problema:** A franquia não tem o card "+ Novo Insumo" no grid.

**Solução:**
- `franchise/src/pages/EstoqueInsumos/EstoqueInsumos.tsx`: adicionar `<button className={styles.cardAdd}>` após `.map()`
- `franchise/src/pages/EstoqueInsumos/EstoqueInsumos.module.scss`: adicionar `.cardAdd` com dashed border e hover amber

## 4. Permissões – 4 melhorias (espelhar sistema principal)

**Problema:** Franquia está desatualizada vs. sistema principal.

**Solução em `franchise/src/pages/Permissoes/Permissoes.tsx`:**
- Adicionar `draftIsAdmin` state, `setDraftIsAdmin(u.isAdmin)` em `selectUser`
- `savePermissions` envia `isAdmin: draftIsAdmin`, chama `setDraftIsAdmin(updated.isAdmin)` após
- Toggle "Administrador" acima do `permHeader` — checked → `setDraftPerms([...ALL_KEYS]); setDraftIsAdmin(true)` / unchecked → clear
- `toggleAll` sincroniza `draftIsAdmin` também
- `emptyForm` ganha `unit: 'main'`; modal ganha `<select>` de Sistema (Principal/Franquia/Fábrica)
- `createUser` passa `unit: form.unit`
- `ALL_PAGES` recebe `contratos`, `cardapios` no grupo Gestão e `permissoes` no grupo Sistema
- `franchise/src/pages/Permissoes/Permissoes.module.scss`: adicionar `.adminToggleRow` e `.adminToggleLabel`
