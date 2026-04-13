import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

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
  pizzaTeam: { type: String, default: '' },
  drinksTeam: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  paymentConditions: { type: String, default: '' },
  terms: { type: String, default: '' },
  menuId: { type: String, default: '' },
  status: { type: String, default: 'rascunho' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'contracts', franchise: 'franchisecontracts', factory: 'factorycontracts' });

const router = Router();

router.get('/', async (req, res) => res.json(await models.getModel(req).find({})));

router.post('/', async (req, res) =>
  res.status(201).json(await models.getModel(req).create({ ...req.body, source: models.getSource(req) })));

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  await found.model.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
