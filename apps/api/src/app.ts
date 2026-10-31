import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';
import eventsRouter from './modules/events/events.routes';
import { financeCategoryRoutes, invoiceRoutes } from './modules/finance/finance.routes';
import financeRouter from './modules/finance/finance.routes';
import { authRoutes, franchiseRoutes, userRoutes } from './modules/identity/identity.routes';
import {
  auditLogRoutes,
  chatRoutes,
  contractorCategoryRoutes,
  contractorRoutes,
  contractRoutes,
  dashboardRoutes,
  employeeRoutes,
  menuRoutes,
  supplyCategoryRoutes,
  supplyRoutes,
  taskHistoryRoutes,
  taskRoutes,
  utensilCategoryRoutes,
  utensilRoutes,
} from './modules/operations/operations.routes';
import { productionOrdersRoutes, productionRecipesRoutes } from './modules/production/production.routes';
import { authMiddleware, optionalAuth } from './infrastructure/middleware/auth';
import { responseEnvelope } from './infrastructure/http/response-envelope';
import { createMainCertificateRouter } from './modules/fiscal/main-certificate.routes';
import { randomUUID } from 'node:crypto';
import { normalizeApiError } from './infrastructure/http/errors';
import { createRateLimit } from './infrastructure/middleware/rate-limit';

const app = express();
const defaultCorsOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const corsOrigins = new Set(
  (process.env.CORS_ORIGINS || defaultCorsOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.has(origin)) return callback(null, true);
      return callback(new Error('cors_origin_denied'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-System', 'X-Franchise-Id'],
  }),
);
app.use(express.json({ limit: '8mb' }));
app.use(cookieParser());
app.use(optionalAuth);
app.use(responseEnvelope);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth/login', createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware);

app.use('/api/events', eventsRouter);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-history', taskHistoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/contractor-categories', contractorCategoryRoutes);
app.use('/api/finances', financeRouter);
app.use('/api/finance-categories', financeCategoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/utensils', utensilRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/utensil-categories', utensilCategoryRoutes);
app.use('/api/supply-categories', supplyCategoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/franchises', franchiseRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/fiscal/certificado', createMainCertificateRouter());
app.use('/api/chat', createRateLimit({ windowMs: 60 * 1000, max: 30 }));
app.use('/api/chat', chatRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/production-recipes', productionRecipesRoutes);
app.use('/api/production-orders', productionOrdersRoutes);

const franchiseDist = path.join(process.cwd(), 'apps/franchise/dist');
app.use('/itu', express.static(franchiseDist));
app.get(['/itu', '/itu/*'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(franchiseDist, 'index.html'));
});
app.use('/franchise-assets', express.static(franchiseDist));
app.get(['/franquias/:slug', '/franquias/:slug/*'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(franchiseDist, 'index.html'));
});

const factoryDist = path.join(process.cwd(), 'apps/factory/dist');
app.use('/fabrica', express.static(factoryDist));
app.get(['/fabrica', '/fabrica/*'], (_req, res) => res.sendFile(path.join(factoryDist, 'index.html')));

const mainDist = path.join(process.cwd(), 'apps/main/dist');
app.use(express.static(mainDist));
app.get('*', (_req, res) => res.sendFile(path.join(mainDist, 'index.html')));

app.use((err: any, req: any, res: any, _next: any) => {
  const requestId = randomUUID();
  const normalized = normalizeApiError(err);
  console.error(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path} -> ${normalized.status}:`, err);
  if (!res.headersSent) {
    res.status(normalized.status).json({
      error: { code: normalized.code, message: normalized.message, details: normalized.details, requestId },
    });
  }
});

export default app;
