import mongoose from 'mongoose';
import { Finance, FranchiseFinance } from '../finance/finance.model';
import { Employee, FranchiseEmployee } from '../operations/employees.routes';
import { Event, FranchiseEvent } from './events.model';
import { canChangeForecast } from '../../../../../shared/finance/financePolicy';
import { syncEventFinances, calculateEventFinanceAmounts } from './events.finance';

type FinanceModel = typeof Finance;

export async function cancelMutableAutomaticFinances(
  FinanceModel: FinanceModel,
  query: Record<string, unknown>,
  reversalReason: string,
) {
  const activeFinances = await FinanceModel.find(query).lean();
  const mutableIds = activeFinances
    .filter((finance: any) => canChangeForecast(finance))
    .map((finance: any) => finance._id);
  if (mutableIds.length === 0) return;

  await FinanceModel.updateMany(
    { _id: { $in: mutableIds } },
    { $set: { reversedAt: new Date().toISOString(), reversalReason, settlementStatus: 'cancelled' } },
  );
}

export function canSyncAutomaticCommission(existing: any): boolean {
  return !existing || canChangeForecast(typeof existing.toJSON === 'function' ? existing.toJSON() : existing);
}

export async function syncEventCommissions(event: any, FinanceModel: FinanceModel, source: string) {
  const employeeModel = source === 'franchise' ? FranchiseEmployee : Employee;
  const employeeIds = Array.from(
    new Set(
      [
        ...(Array.isArray(event.selectedEmployeeIds) ? event.selectedEmployeeIds : []),
        event.responsibleEmployeeId,
      ].filter((id) => typeof id === 'string' && mongoose.isValidObjectId(id)),
    ),
  ) as string[];
  const eventId = event.id || event._id.toString();
  const franchiseScope = source === 'franchise' ? { franchiseId: event.franchiseId } : {};
  const activeQuery = {
    ...franchiseScope,
    eventId,
    kind: 'commission',
    automatic: true,
    reversedAt: { $exists: false },
  };

  if (employeeIds.length === 0) {
    await cancelMutableAutomaticFinances(FinanceModel, activeQuery, 'Equipe removida do evento');
    return;
  }

  const employees = (await employeeModel
    .find({ ...franchiseScope, _id: { $in: employeeIds }, commissionRate: { $gt: 0 } })
    .lean()) as any[];
  const { targetRevenue } = calculateEventFinanceAmounts(event);
  const eligibleIds = employees.map((employee) => employee._id.toString());

  await cancelMutableAutomaticFinances(
    FinanceModel,
    { ...activeQuery, employeeId: { $nin: eligibleIds } },
    'Comissao deixou de ser aplicavel',
  );

  for (const employee of employees) {
    const amount = calculateCommissionAmount(targetRevenue, Number(employee.commissionRate));
    if (amount <= 0) continue;
    const commissionQuery = { ...activeQuery, employeeId: employee._id.toString() };
    const existingCommission = await FinanceModel.findOne(commissionQuery);
    if (!canSyncAutomaticCommission(existingCommission)) continue;
    await FinanceModel.findOneAndUpdate(
      commissionQuery,
      {
        eventId,
        employeeId: employee._id.toString(),
        type: 'cost',
        category: 'comissoes',
        description: `Comissao ${employee.commissionRate}% - ${employee.name} - ${event.name}`,
        amount,
        date: event.date,
        dueDate: event.date,
        status: 'pending',
        settlementStatus: 'open',
        origin: 'event',
        kind: 'commission',
        automatic: true,
        source,
        ...(source === 'franchise' && { franchiseId: event.franchiseId }),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export function calculateCommissionAmount(revenue: number, rate: number) {
  const safeRevenue = Math.max(Number(revenue) || 0, 0);
  const safeRate = Math.min(100, Math.max(Number(rate) || 0, 0));
  return Math.round(((safeRevenue * safeRate) / 100) * 100) / 100;
}

export async function backfillEventFinances() {
  const [mainEvents, franchiseEvents] = await Promise.all([
    Event.find({ financeSyncVersion: { $ne: 1 } }),
    FranchiseEvent.find({ financeSyncVersion: { $ne: 1 } }),
  ]);
  const runInBatches = async (events: any[], model: FinanceModel, source: string) => {
    const batchSize = 50;
    for (let index = 0; index < events.length; index += batchSize) {
      await Promise.all(events.slice(index, index + batchSize).map((event) => syncEventFinances(event, model, source)));
    }
  };
  await runInBatches(mainEvents, Finance, 'main');
  await runInBatches(franchiseEvents, FranchiseFinance, 'franchise');
  return { main: mainEvents.length, franchise: franchiseEvents.length };
}
