import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';
import { logAudit } from '../utils/audit';

const models = createTenantModels('Contract', {
  clientName: String,
  clientDocument: { type: String, default: '' },
  clientRg: { type: String, default: '' },
  clientAddress: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  eventId: { type: String, default: '' },
  value: { type: Number, default: 0 },
  pricePerAdult: { type: Number, default: 0 },
  adultsCount: { type: Number, default: 0 },
  pricePerChild: { type: Number, default: 0 },
  childrenCount: { type: Number, default: 0 },
  additionalServices: { type: String, default: '' },
  minGuests: { type: Number, default: 0 },
  serviceType: { type: String, default: 'self service e coquetel' },
  drinksDescription: { type: String, default: '' },
  cancellationDays: { type: Number, default: 30 },
  pizzaTeam: { type: Number, default: 0 },
  drinksTeam: { type: Number, default: 0 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  paymentConditions: { type: String, default: '' },
  terms: { type: String, default: '' },
  menuId: { type: String, default: '' },
  paid: { type: Boolean, default: false },
  noticeHours: { type: Number, default: 1 },
  serviceObservation: { type: String, default: '' },
  paymentObservation: { type: String, default: '' },
  lateFeePercent: { type: Number, default: 30 },
  lateFeeHours: { type: Number, default: 48 },
  additionalServicesObservation: { type: String, default: '' },
  status: { type: String, default: 'rascunho' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'contracts', franchise: 'franchisecontracts', factory: 'factorycontracts' });

const router = Router();

router.get('/', async (req, res) => res.json(await models.getModel(req).find({})));

router.post('/', async (req, res) => {
  const contract = await models.getModel(req).create({ ...req.body, source: models.getSource(req) });
  await logAudit({ req, action: 'create', resource: 'contracts', resourceId: contract.id, description: `Criou contrato: ${contract.clientName || contract.description || contract.id}` });
  res.status(201).json(contract);
});

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const updated = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'contracts', resourceId: req.params.id, description: `Atualizou contrato: ${updated?.clientName || updated?.description || req.params.id}` });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const contract = await found.model.findById(req.params.id);
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'contracts', resourceId: req.params.id, description: `Excluiu contrato: ${contract?.clientName || contract?.description || req.params.id}` });
  res.status(204).end();
});

export default router;
