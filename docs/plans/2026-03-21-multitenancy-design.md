# Multi-tenancy (Franchise + Factory) Design

**Data:** 2026-03-21

## Contexto

O Soul540 possui três sistemas: principal (HQ), franquia e fábrica. O principal enxerga dados de todas as unidades. Franquia e fábrica enxergam apenas seus próprios dados. O backend é compartilhado (Railway). Existe uma franquia e uma fábrica.

## Backend

### Campo `unit` nos models
Adicionar `unit: { type: String, enum: ['main', 'franchise', 'factory'], default: 'main' }` em todos os models:
- Event, Task, Finance, Employee, Contractor, Supply, Utensil, Cardapio, Contract, User

Dados existentes mantêm `unit: 'main'` (aplicado via script de migração).

### Middleware de tenant
Um middleware `tenantFilter` injetado em todas as rotas protegidas:
- Usuário com `unit: 'main'` → sem filtro (vê tudo)
- Usuário com `unit: 'franchise'` ou `unit: 'factory'` → injeta `{ unit: req.user.unit }` automaticamente em todas as queries

### Usuários
O model `User` ganha campo `unit`. Dois usuários criados via script:
- `franquia@soul540.com` / `franquia123` / `unit: 'franchise'`
- `fabrica@soul540.com` / `fabrica123` / `unit: 'factory'`

## Frontend (franchise/ e factory/)

### Autenticação real
Substituir mock auth por chamadas reais ao Railway (`POST /api/auth/login`). Token JWT salvo no localStorage.

### Contexto de dados
Copiar `AppContext` do principal para cada app, ajustando imports (`@frontend/` → `@/`). Endpoints idênticos — backend filtra automaticamente pelo `unit` do usuário.

### Componentes compartilhados
Copiar para cada app: `Button`, `Input`, `Modal`, `Badge`, `ConfirmModal`, `CalendarView`, `GaugeChart`, `HorizontalBarChart`.

### Páginas
Copiar todas as páginas relevantes com ajuste de imports. Franchise inclui Cardápios, factory não.

### Variável de ambiente
`.env` de cada app: `VITE_API_URL=https://soul540-production.up.railway.app`

## Migração de dados

Script que:
1. Adiciona `unit: 'main'` a todos os documentos existentes sem o campo
2. Cria os dois novos usuários (franquia e fábrica)

## Deploy

- **Backend (Railway):** push automático via GitHub
- **Franchise/Factory (Vercel):** dois novos projetos apontando para `franchise/` e `factory/`, com `VITE_API_URL` configurado nas env vars
