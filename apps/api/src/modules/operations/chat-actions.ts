import { Event, FactoryEvent, FranchiseEvent } from '../events/events.model';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getFranchiseFilter, injectFranchiseScope } from '../../infrastructure/franchise-scope';
import { getFinanceFilter, getFinanceModelForUnit } from '../finance/finance-tenant';
import { FactoryTask, Task, FranchiseTask } from './tasks.routes';
import { Employee, FactoryEmployee, FranchiseEmployee } from './employees.routes';
import { Contractor, FactoryContractor, FranchiseContractor } from './contractors.routes';
import { createFinanceSchema } from '../../infrastructure/schemas/finances';
import { logAudit } from '../../infrastructure/audit-log';
import { hasPermission } from '../../infrastructure/middleware/permissions';
import { z } from 'zod';
export { parseChatAction, SYSTEM_PROMPT } from './chat-contract';

function assertPermission(req: any, permission: string, mode: 'read' | 'write' = 'read') {
  if (!hasPermission(req.user, permission, mode)) {
    throw Object.assign(new Error('Permissão insuficiente para esta ação'), {
      status: 403,
      code: 'permission_denied',
    });
  }
}

export async function executeChatAction(req: any, action: string, params: any): Promise<any> {
  const unit = getTenantUnit(req);
  const franchise = unit === 'franchise';
  const factory = unit === 'factory';
  const limit =
    typeof params.limit === 'number' && Number.isFinite(params.limit)
      ? Math.min(50, Math.max(1, Math.floor(params.limit)))
      : 10;
  const status = typeof params.status === 'string' ? params.status : 'all';
  switch (action) {
    case 'query_events': {
      assertPermission(req, 'eventos');
      const filter: any = {};
      if (['upcoming', 'completed', 'cancelled'].includes(status)) filter.status = status;
      const model = franchise ? FranchiseEvent : factory ? FactoryEvent : Event;
      return model
        .find(franchise ? getFranchiseFilter(req, filter) : filter)
        .limit(limit)
        .lean();
    }
    case 'query_tasks': {
      assertPermission(req, 'tarefas');
      const filter: any = {};
      if (['todo', 'in_progress', 'done'].includes(status)) filter.status = status;
      if (typeof params.priority === 'string' && ['urgent', 'high', 'medium', 'low'].includes(params.priority)) {
        filter.priority = params.priority;
      }
      const model = franchise ? FranchiseTask : factory ? FactoryTask : Task;
      return model
        .find(franchise ? getFranchiseFilter(req, filter) : filter)
        .limit(20)
        .lean();
    }
    case 'query_finances': {
      assertPermission(req, 'financeiro');
      const filter: any = {};
      if (params.type === 'revenue' || params.type === 'cost') filter.type = params.type;
      const model = getFinanceModelForUnit(unit);
      return model
        .find(getFinanceFilter(req, model, filter))
        .sort({ date: -1 })
        .limit(limit)
        .lean();
    }
    case 'query_employees': {
      assertPermission(req, 'funcionarios');
      const filter: any = {};
      if (status === 'active' || status === 'inactive') filter.status = status === 'active' ? 'ativo' : 'inativo';
      const model = franchise ? FranchiseEmployee : factory ? FactoryEmployee : Employee;
      return model
        .find(franchise ? getFranchiseFilter(req, filter) : filter)
        .limit(20)
        .lean();
    }
    case 'query_contractors': {
      assertPermission(req, 'contratantes');
      const filter: any = {};
      if (status === 'active' || status === 'inactive') filter.status = status === 'active' ? 'ativo' : 'inativo';
      const model = franchise ? FranchiseContractor : factory ? FactoryContractor : Contractor;
      return model
        .find(franchise ? getFranchiseFilter(req, filter) : filter)
        .limit(20)
        .lean();
    }
    case 'create_finance': {
      assertPermission(req, 'financeiro', 'write');
      const parsed = createFinanceSchema.safeParse({ ...params, status: params.status || 'paid' });
      if (!parsed.success)
        throw Object.assign(new Error('Dados financeiros inválidos'), { status: 400, code: 'invalid_finance' });
      const model = getFinanceModelForUnit(unit);
      const finance = await model.create(injectFranchiseScope(req, { ...parsed.data, source: unit }));
      await logAudit({
        req,
        action: 'create',
        resource: 'finances',
        resourceId: finance.id,
        description: 'Criou lançamento via chat',
      });
      return finance.toJSON();
    }
    case 'create_task': {
      assertPermission(req, 'tarefas', 'write');
      const parsed = z
        .object({
          title: z.string().trim().min(1).max(200),
          description: z.string().max(2000).optional().default(''),
          status: z.enum(['backlog', 'todo', 'in_progress', 'done']).optional().default('backlog'),
          priority: z.enum(['urgent', 'high', 'medium', 'low']).optional().default('medium'),
          dueDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
        })
        .safeParse(params);
      if (!parsed.success)
        throw Object.assign(new Error('Dados da tarefa inválidos'), { status: 400, code: 'invalid_task' });
      const model = franchise ? FranchiseTask : factory ? FactoryTask : Task;
      const task = await model.create({ ...injectFranchiseScope(req, parsed.data), source: unit });
      await logAudit({
        req,
        action: 'create',
        resource: 'tasks',
        resourceId: task.id,
        description: 'Criou tarefa via chat',
      });
      return task.toJSON();
    }
    default:
      return null;
  }
}
