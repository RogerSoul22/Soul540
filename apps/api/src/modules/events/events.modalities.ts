import { canConfirmWeeklyOccurrence } from '@soul540/domain';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { logAudit } from '../../infrastructure/audit-log';
import { findEventForRequest, syncEventFinances } from './events.finance';

export function shouldSyncEventFinances(event: { isRecurringTemplate?: boolean }): boolean {
  return event.isRecurringTemplate !== true;
}

export function normalizeEventPayload(body: Record<string, unknown>) {
  const modality = body.modality === 'feirinha' ? 'feirinha' : 'evento_avulso';
  return {
    ...body,
    modality,
    isRecurringTemplate: modality === 'feirinha' && body.isRecurringTemplate === true,
    recurrenceEndDate: modality === 'feirinha' ? body.recurrenceEndDate || undefined : undefined,
  };
}

export function normalizeEventUpdatePayload(body: Record<string, unknown>) {
  const update = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, 'modality'))
    update.modality = body.modality === 'feirinha' ? 'feirinha' : 'evento_avulso';
  if (Object.prototype.hasOwnProperty.call(body, 'isRecurringTemplate'))
    update.isRecurringTemplate = body.isRecurringTemplate === true && body.modality !== 'evento_avulso';
  if (Object.prototype.hasOwnProperty.call(body, 'recurrenceEndDate'))
    update.recurrenceEndDate = body.modality === 'evento_avulso' ? undefined : body.recurrenceEndDate || undefined;
  return update;
}

export async function confirmRecurringOccurrence(req: any, res: any) {
  if (getTenantUnit(req) === 'factory') return res.status(403).json({ error: 'Factory cannot confirm occurrences' });
  const found = await findEventForRequest(req, req.params.id);
  const occurrenceDate = typeof req.body?.date === 'string' ? req.body.date : '';
  if (!found || !found.doc.isRecurringTemplate) return res.status(404).json({ error: 'Recurring template not found' });
  if (!canConfirmWeeklyOccurrence(found.doc, occurrenceDate))
    return res.status(422).json({ error: 'Data fora da recorrência semanal' });
  const existing = await found.model.findOne(
    getFranchiseFilter(req, { recurrenceId: found.doc.id, date: occurrenceDate, isRecurringTemplate: false }),
  );
  if (existing) return res.json(existing);
  const source = found.doc.toObject();
  delete source._id;
  delete source.id;
  delete source.createdAt;
  delete source.recurrenceEndDate;
  const event = await found.model.create({
    ...source,
    date: occurrenceDate,
    status: 'confirmed',
    modality: 'feirinha',
    isRecurringTemplate: false,
    recurrenceId: found.doc.id,
  });
  await syncEventFinances(event, found.financeModel, found.financeSource);
  await logAudit({
    req,
    action: 'create',
    resource: 'events',
    resourceId: event.id,
    description: `Confirmou ocorrência de Feirinha: ${event.name} (${event.date})`,
  });
  res.status(201).json(event);
}
