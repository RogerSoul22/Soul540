# Multi-tenancy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar suporte multi-tenancy ao backend e conectar os apps franchise/ e factory/ ao backend real com dados separados por unidade.

**Architecture:** Campo `unit` em todos os models MongoDB. Middleware de auth lê o token do header Authorization, extrai o userId, busca o user no banco e injeta `req.user`. Middleware de tenant filtra queries automaticamente por `req.user.unit`. Se nenhum token enviado, assume unit='main' (compatibilidade retroativa com o app principal). Franchise e factory enviam token JWT e recebem apenas seus dados.

**Tech Stack:** Express, Mongoose, TypeScript, React, Vite, SCSS Modules, date-fns

---

## Task 1: Adicionar campo `unit` ao UserSchema e atualizar login

**Files:**
- Modify: `server/routes/auth.ts`
- Modify: `src/backend/domain/entities/User.ts`

**Step 1: Adicionar `unit` ao UserSchema em `server/routes/auth.ts`**

Substituir o UserSchema existente por:
```typescript
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  permissions: { type: [String], default: [] },
  unit: { type: String, enum: ['main', 'franchise', 'factory'], default: 'main' },
}, { toJSON: { virtuals: true, versionKey: false } });
```

**Step 2: Atualizar resposta do login para incluir `unit`**

Na rota `router.post('/login', ...)`, alterar a linha `res.json(...)` para incluir `unit`:
```typescript
res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, permissions: user.permissions, unit: (user as any).unit || 'main' } });
```

**Step 3: Atualizar a entidade User em `src/backend/domain/entities/User.ts`**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  isAdmin: boolean;
  permissions: string[];
  unit: 'main' | 'franchise' | 'factory';
}
```

**Step 4: Commit**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540" && git add server/routes/auth.ts src/backend/domain/entities/User.ts && git commit -m "feat(backend): add unit field to UserSchema"
```

---

## Task 2: Criar middleware de autenticação

**Files:**
- Create: `server/middleware/auth.ts`

**Step 1: Criar `server/middleware/auth.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../routes/auth';

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(); // sem token = req.user undefined (main)

  const token = authHeader.replace('Bearer ', '');
  // token format: "token-{userId}-{timestamp}"
  const parts = token.split('-');
  if (parts.length < 2) return next();

  const userId = parts[1];
  try {
    const user = await UserModel.findById(userId).lean();
    if (user) (req as any).user = user;
  } catch {
    // token inválido — ignora
  }
  next();
}
```

**Step 2: Criar `server/middleware/tenant.ts`**

```typescript
export function getTenantFilter(req: any): Record<string, string> {
  const unit = req.user?.unit;
  if (!unit || unit === 'main') return {}; // principal vê tudo
  return { unit };
}

export function getTenantUnit(req: any): string {
  return req.user?.unit || 'main';
}
```

**Step 3: Registrar o middleware em `server/app.ts`**

Adicionar import e uso antes das rotas:
```typescript
import { optionalAuth } from './middleware/auth';
// ... após app.use(express.json()):
app.use(optionalAuth);
```

**Step 4: Commit**
```bash
git add server/middleware/ server/app.ts && git commit -m "feat(backend): add optional auth and tenant middleware"
```

---

## Task 3: Adicionar campo `unit` e filtro de tenant nas rotas principais

**Files:**
- Modify: `server/routes/events.ts`
- Modify: `server/routes/tasks.ts`
- Modify: `server/routes/finances.ts`
- Modify: `server/routes/employees.ts`

**Step 1: Atualizar `server/routes/events.ts`**

1. Adicionar ao EventSchema: `unit: { type: String, default: 'main' }`
2. Adicionar import do tenant: `import { getTenantFilter, getTenantUnit } from '../middleware/tenant';`
3. Atualizar GET: `Event.find(getTenantFilter(req)).sort({ date: 1 })`
4. Atualizar POST (no `Event.create`): spread `unit: getTenantUnit(req)` no body
5. Atualizar os `Finance.create` dentro do eventos para incluir `unit: getTenantUnit(req)`

Resultado final do GET e POST:
```typescript
router.get('/', async (req, res) => {
  const events = await Event.find(getTenantFilter(req)).sort({ date: 1 });
  res.json(events);
});

router.post('/', async (req, res) => {
  const event = await Event.create({ ...req.body, unit: getTenantUnit(req) });
  if (event.budget && event.budget > 0) {
    await Finance.create({
      eventId: event.id,
      type: 'revenue',
      category: 'contrato',
      description: `Contrato - ${event.name}`,
      amount: event.budget,
      date: event.date,
      status: 'pending',
      autoEventBudget: true,
      unit: getTenantUnit(req),
    });
  }
  res.status(201).json(event);
});
```

PUT e DELETE não precisam de filtro (o ID já identifica o documento).

**Step 2: Atualizar `server/routes/tasks.ts`**

Ler o arquivo atual, então:
1. Adicionar ao TaskSchema: `unit: { type: String, default: 'main' }`
2. Adicionar import: `import { getTenantFilter, getTenantUnit } from '../middleware/tenant';`
3. GET: `Task.find(getTenantFilter(req))`
4. POST: `Task.create({ ...req.body, unit: getTenantUnit(req) })`

**Step 3: Atualizar `server/routes/finances.ts`**

Ler o arquivo atual, então:
1. Adicionar ao FinanceSchema: `unit: { type: String, default: 'main' }`
2. Adicionar import do tenant
3. GET: `Finance.find(getTenantFilter(req))`
4. POST: `Finance.create({ ...req.body, unit: getTenantUnit(req) })`

**Step 4: Atualizar `server/routes/employees.ts`**

Ler o arquivo atual, então:
1. Adicionar ao EmployeeSchema: `unit: { type: String, default: 'main' }`
2. Adicionar import do tenant
3. GET: `Employee.find(getTenantFilter(req)).sort({ name: 1 })`
4. POST: `Employee.create({ ...req.body, unit: getTenantUnit(req) })`

**Step 5: Commit**
```bash
git add server/routes/events.ts server/routes/tasks.ts server/routes/finances.ts server/routes/employees.ts && git commit -m "feat(backend): add unit field and tenant filter to events/tasks/finances/employees"
```

---

## Task 4: Adicionar `unit` nas rotas restantes

**Files:**
- Modify: `server/routes/contractors.ts`
- Modify: `server/routes/supplies.ts`
- Modify: `server/routes/utensils.ts`

Para cada arquivo, seguir o mesmo padrão do Task 3:
1. Ler o arquivo
2. Adicionar `unit: { type: String, default: 'main' }` ao Schema
3. Adicionar import do tenant middleware
4. Atualizar GET com `getTenantFilter(req)`
5. Atualizar POST com `unit: getTenantUnit(req)`

(utensil-categories, supply-categories e contractor-categories são dados de configuração compartilhados — NÃO adicionar filtro de tenant neles)

**Step: Commit**
```bash
git add server/routes/contractors.ts server/routes/supplies.ts server/routes/utensils.ts && git commit -m "feat(backend): add unit field and tenant filter to contractors/supplies/utensils"
```

---

## Task 5: Script de migração e criação de usuários

**Files:**
- Create: `server/seed-units.ts`

**Step 1: Criar `server/seed-units.ts`**

```typescript
import 'dotenv/config';
import { connectDB } from './db';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Models mínimos para migração
const collections = ['events', 'tasks', 'finances', 'employees', 'contractors', 'supplies', 'utensils'];

const UserSchema = new Schema({
  name: String, email: String, passwordHash: String,
  isAdmin: Boolean, permissions: [String],
  unit: { type: String, default: 'main' },
}, { collection: 'users' });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  await connectDB();
  console.log('✅ Conectado');

  // 1. Migrar documentos existentes sem unit
  for (const col of collections) {
    const db = mongoose.connection.db!;
    const result = await db.collection(col).updateMany(
      { unit: { $exists: false } },
      { $set: { unit: 'main' } }
    );
    console.log(`${col}: ${result.modifiedCount} documentos atualizados`);
  }

  // 2. Criar usuário franquia (se não existir)
  const franchiseExists = await User.findOne({ email: 'franquia@soul540.com' });
  if (!franchiseExists) {
    const hash = await bcrypt.hash('franquia123', 10);
    await User.create({
      name: 'Admin Franquia',
      email: 'franquia@soul540.com',
      passwordHash: hash,
      isAdmin: false,
      permissions: [],
      unit: 'franchise',
    });
    console.log('✅ Usuário franquia criado');
  } else {
    console.log('ℹ️ Usuário franquia já existe');
  }

  // 3. Criar usuário fábrica (se não existir)
  const factoryExists = await User.findOne({ email: 'fabrica@soul540.com' });
  if (!factoryExists) {
    const hash = await bcrypt.hash('fabrica123', 10);
    await User.create({
      name: 'Admin Fábrica',
      email: 'fabrica@soul540.com',
      passwordHash: hash,
      isAdmin: false,
      permissions: [],
      unit: 'factory',
    });
    console.log('✅ Usuário fábrica criado');
  } else {
    console.log('ℹ️ Usuário fábrica já existe');
  }

  console.log('✅ Migração concluída');
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
```

**Step 2: Adicionar script no `package.json`**

Adicionar em `"scripts"`:
```json
"seed:units": "tsx server/seed-units.ts"
```

**Step 3: Rodar o script**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540" && npm run seed:units
```

Expected output:
```
✅ Conectado
events: N documentos atualizados
...
✅ Usuário franquia criado
✅ Usuário fábrica criado
✅ Migração concluída
```

**Step 4: Commit**
```bash
git add server/seed-units.ts package.json && git commit -m "feat(backend): add migration script and franchise/factory users"
```

---

## Task 6: Frontend — Shared infrastructure para franchise/ e factory/

**Files (para cada app — repetir para franchise/ E factory/):**
- Create: `franchise/src/lib/api.ts`
- Create: `franchise/src/lib/storage.ts`
- Create: `franchise/.env`

**Step 1: Criar `franchise/.env`**
```
VITE_API_URL=https://soul540-production.up.railway.app
```

**Step 2: Criar `franchise/src/lib/storage.ts`**
```typescript
const TOKEN_KEY = 'soul540_token';
const USER_KEY = 'soul540_user';

export const Storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  getUser: <T>(): T | null => {
    const d = localStorage.getItem(USER_KEY);
    return d ? JSON.parse(d) : null;
  },
  setUser: <T>(u: T) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};
```

**Step 3: Criar `franchise/src/lib/api.ts`**
```typescript
import { Storage } from './storage';

const BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = Storage.getToken();
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
```

**Step 4: Repetir os mesmos 3 arquivos para `factory/`**
- `factory/.env` — mesmo conteúdo
- `factory/src/lib/storage.ts` — idêntico
- `factory/src/lib/api.ts` — idêntico

**Step 5: Commit**
```bash
git add franchise/.env franchise/src/lib/ factory/.env factory/src/lib/ && git commit -m "feat(franchise,factory): add api helper and storage lib"
```

---

## Task 7: Frontend — Substituir AuthContext mock pelo real nos dois apps

**Files:**
- Modify: `franchise/src/contexts/AuthContext.tsx`
- Modify: `factory/src/contexts/AuthContext.tsx`

**Step 1: Substituir `franchise/src/contexts/AuthContext.tsx`**

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { Storage } from '@/lib/storage';

interface User { id: string; name: string; email: string; isAdmin: boolean; permissions: string[]; unit: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = Storage.getUser<User>();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Email ou senha incorretos');
    }
    const data = await res.json();
    Storage.setToken(data.token);
    Storage.setUser(data.user);
    setUser(data.user);
  };

  const logout = () => {
    Storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Step 2: Fazer o mesmo para `factory/src/contexts/AuthContext.tsx`** — conteúdo idêntico.

**Step 3: Commit**
```bash
git add franchise/src/contexts/AuthContext.tsx factory/src/contexts/AuthContext.tsx && git commit -m "feat(franchise,factory): replace mock auth with real API auth"
```

---

## Task 8: Frontend — AppContext real para franchise/ e factory/

**Files:**
- Create: `franchise/src/contexts/AppContext.tsx`
- Create: `factory/src/contexts/AppContext.tsx`

**Step 1: Criar `franchise/src/contexts/AppContext.tsx`**

Copiar `src/frontend/contexts/AppContext.tsx` integralmente e aplicar estas mudanças:
- Remover todos os imports `@backend/...` — substituir por types inline (ver abaixo)
- Substituir todos os `fetch('/api/...')` por `apiFetch('/api/...')`
- Adicionar import: `import { apiFetch } from '@/lib/api';`
- Remover import de `mockInvoices` e `Invoice` (não existe no backend real) — remover todo o código de invoices
- Remover `invoices`, `addInvoice`, `updateInvoice`, `deleteInvoice` do contexto

Types inline a adicionar no topo do arquivo (substituindo os imports @backend):
```typescript
interface PizzaEvent { id: string; name: string; date: string; endDate?: string; time?: string; location?: string; guestCount?: number; status?: string; budget?: number; menu?: string[]; notes?: string; responsibleEmployeeId?: string; selectedEmployeeIds?: string[]; createdAt?: string; [key: string]: any; }
interface FinanceEntry { id: string; type: string; category: string; description: string; amount: number; date: string; status: string; eventId?: string; autoEventBudget?: boolean; [key: string]: any; }
interface Task { id: string; title: string; description?: string; priority?: string; status?: string; dueDate?: string; createdAt?: string; [key: string]: any; }
```

AppContextData (sem invoices):
```typescript
interface AppContextData {
  events: PizzaEvent[];
  finances: FinanceEntry[];
  tasks: Task[];
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => Promise<FinanceEntry>;
  updateFinance: (id: string, data: Partial<FinanceEntry>) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<PizzaEvent>;
  updateEvent: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}
```

**Step 2: Fazer o mesmo para `factory/src/contexts/AppContext.tsx`** — conteúdo idêntico.

**Step 3: Commit**
```bash
git add franchise/src/contexts/AppContext.tsx factory/src/contexts/AppContext.tsx && git commit -m "feat(franchise,factory): add real AppContext with API calls"
```

---

## Task 9: Frontend — Copiar todos os componentes para franchise/ e factory/

**Files:**
- Copy all: `src/frontend/components/{Badge,Button,Input,Modal,ConfirmModal,CalendarView,GaugeChart,HorizontalBarChart}/`
  → `franchise/src/components/` e `factory/src/components/`

**Step 1: Para cada componente, copiar os arquivos e ajustar imports**

Componentes a copiar (cada um tem .tsx + .module.scss):
- Badge
- Button
- Input
- Modal
- ConfirmModal
- CalendarView
- GaugeChart
- HorizontalBarChart

Para cada arquivo copiado:
- Substituir `@frontend/` → `@/`
- Ajustar `@use` paths do SCSS para `../../styles/variables` ou o caminho relativo correto

**Step 2: Copiar para franchise/ e factory/**

```bash
# Copiar de src/frontend/components para franchise/src/components
# e para factory/src/components
# (copiar os 8 componentes em ambas as pastas)
```

**Step 3: Commit**
```bash
git add franchise/src/components/ factory/src/components/ && git commit -m "feat(franchise,factory): copy shared UI components"
```

---

## Task 10: Frontend — Copiar páginas para franchise/

**Files:**
- Replace all mock pages in `franchise/src/pages/` with full implementations

**Step 1: Para cada página do principal, copiar para franchise/**

Páginas a copiar (ajustar imports `@frontend/` → `@/` e `@backend/` → types inline ou remover):
- Dashboard → substituir o mock atual
- Funcionarios
- Contratantes
- Eventos
- EstoqueInsumos
- EstoqueUtensilios
- Cardapios
- Permissoes
- Financeiro

Para cada página:
1. Ler `src/frontend/pages/[Nome]/[Nome].tsx`
2. Escrever em `franchise/src/pages/[Nome]/[Nome].tsx` com imports ajustados
3. Ler `src/frontend/pages/[Nome]/[Nome].module.scss`
4. Escrever em `franchise/src/pages/[Nome]/[Nome].module.scss` com `@use` path ajustado

Ajustes de import em cada arquivo:
- `@frontend/hooks/useAuth` → `@/contexts/AuthContext`
- `@frontend/contexts/AppContext` → `@/contexts/AppContext`
- `@frontend/contexts/AuthContext` → `@/contexts/AuthContext`
- `@frontend/components/X/X` → `@/components/X/X`
- `@frontend/routes` → `@/routes`
- Remover qualquer import `@backend/...` — substituir tipos por `any` ou interface inline

**Step 2: Atualizar App.tsx** para adicionar o AppProvider:
```typescript
// Em franchise/src/App.tsx, wrapping as rotas:
import { AppProvider } from '@/contexts/AppContext';
// adicionar <AppProvider> dentro do <AuthProvider>
```

**Step 3: Verificar build**
```bash
cd franchise && npm run build
```
Corrigir quaisquer erros de TypeScript ou import.

**Step 4: Commit**
```bash
cd .. && git add franchise/ && git commit -m "feat(franchise): replace mock pages with full implementations"
```

---

## Task 11: Frontend — Copiar páginas para factory/

Mesma lógica do Task 10, mas para `factory/src/pages/`:
- Sem Cardapios
- Ajustar imports da mesma forma

**Step 1: Copiar e adaptar cada página** (mesmos passos do Task 10)

**Step 2: Atualizar `factory/src/App.tsx`** para adicionar AppProvider

**Step 3: Verificar build**
```bash
cd factory && npm run build
```

**Step 4: Commit**
```bash
cd .. && git add factory/ && git commit -m "feat(factory): replace mock pages with full implementations"
```

---

## Task 12: Deploy e verificação final

**Step 1: Push backend para Railway**
```bash
git push origin main
```

**Step 2: Rodar migração em produção**
```bash
npm run seed:units
```
(Railway já tem MONGO_URI configurado — rodar localmente com a URI de produção apontada no .env)

**Step 3: Verificar Railway logs**
- Confirmar que o servidor reiniciou sem erros
- Testar `POST /api/auth/login` com `franquia@soul540.com` / `franquia123`

**Step 4: Verificar apps localmente**
```bash
# Terminal 1:
cd franchise && npm run dev
# Login com franquia@soul540.com / franquia123
# Verificar que dados aparecem separados

# Terminal 2:
cd factory && npm run dev
# Login com fabrica@soul540.com / fabrica123
```

**Step 5: Commit final se necessário**
```bash
git add . && git commit -m "fix: post-deploy fixes" && git push origin main
```
