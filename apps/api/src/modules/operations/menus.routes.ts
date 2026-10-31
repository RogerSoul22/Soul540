import { Schema } from 'mongoose';
import { Router } from 'express';
import { createTenantModels } from '../../infrastructure/tenant-model';
import { logAudit } from '../../infrastructure/audit-log';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const MenuItemSchema = new Schema(
  {
    id: String,
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
  },
  { _id: false },
);

const MenuCategorySchema = new Schema(
  {
    id: String,
    name: { type: String, default: '' },
    items: [MenuItemSchema],
  },
  { _id: false },
);

const models = createTenantModels(
  'Menu',
  {
    name: String,
    eventId: { type: String, default: '' },
    headerText: { type: String, default: '' },
    footerText: { type: String, default: '' },
    categories: [MenuCategorySchema],
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { main: 'menus', franchise: 'franchisemenus', factory: 'factorymenus' },
);

const router = Router();
router.use(requirePermission('cardapios', 'read'));

router.get('/', async (req, res) => res.json(await models.getModel(req).find(models.getFilter(req))));

router.post('/', async (req, res) => {
  const menu = await models.getModel(req).create({
    ...models.withScope(req, req.body),
    source: models.getSource(req),
  });
  await logAudit({
    req,
    action: 'create',
    resource: 'menus',
    resourceId: menu.id,
    description: `Criou cardapio: ${menu.name}`,
  });
  res.status(201).json(menu);
});

router.put('/:id', async (req, res) => {
  const model = models.getModel(req);
  if (!(await model.findOne(models.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  const updated = await model.findOneAndUpdate(
    models.getFilter(req, { _id: req.params.id }),
    models.withScope(req, req.body),
    { new: true },
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'menus',
    resourceId: req.params.id,
    description: `Atualizou cardapio: ${updated?.name || req.params.id}`,
  });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const model = models.getModel(req);
  const menu = await model.findOne(models.getFilter(req, { _id: req.params.id }));
  if (!menu) return res.status(404).json({ error: 'Not found' });
  await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), { $set: { deletedAt: new Date() } });
  await logAudit({
    req,
    action: 'delete',
    resource: 'menus',
    resourceId: req.params.id,
    description: `Excluiu cardapio: ${menu?.name || req.params.id}`,
  });
  res.status(204).end();
});

export default router;
