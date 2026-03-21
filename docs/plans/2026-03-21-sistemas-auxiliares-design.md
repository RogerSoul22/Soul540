# Design — Sistemas Auxiliares Soul540

**Data:** 2026-03-21

## Contexto

O Soul540 é o sistema principal de uma empresa com franqueados. Dois sistemas auxiliares serão criados como apps independentes que futuramente se conectarão ao mesmo backend Railway com dados e permissões distintos.

## Estrutura de Pastas

```
Soul540/
├── (app principal — existente)
├── franchise/          ← sistema da franquia
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── factory/            ← sistema da fábrica
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Módulos

| Módulo              | Franquia | Fábrica |
|---------------------|----------|---------|
| Dashboard           | ✓        | ✓       |
| Funcionários        | ✓        | ✓       |
| Contratantes        | ✓        | ✓       |
| Eventos             | ✓        | ✓       |
| Estoque Utensílios  | ✓        | ✓       |
| Estoque Insumos     | ✓        | ✓       |
| Cardápio            | ✓        | —       |
| Permissões          | ✓        | ✓       |
| Financeiro          | ✓        | ✓       |

## Stack

- React + Vite + TypeScript + SCSS Modules (mesma do principal)
- Mesmo design system (cores, sidebar, componentes)
- Dados 100% mock na versão inicial
- Login com tela simples (mock, sem autenticação real)

## Deploy

- Cada sistema vira um projeto separado no Vercel
- Futuramente apontam para o mesmo backend Railway com permissões diferentes por sistema/usuário
