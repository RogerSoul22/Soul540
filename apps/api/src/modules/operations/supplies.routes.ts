import { Router } from 'express';
import { supplyModels } from './supply-model';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const router = Router();
router.use(requirePermission('estoque-insumos', 'read'));

router.get('/', async (req, res) => res.json(await supplyModels.getModel(req).find(supplyModels.getFilter(req))));

router.post('/', async (req, res) =>
  res.status(201).json(
    await supplyModels.getModel(req).create({
      ...supplyModels.withScope(req, safeSupplyInput(req.body)),
      source: supplyModels.getSource(req),
    }),
  ),
);

router.put('/:id', async (req, res) => {
  const model = supplyModels.getModel(req);
  if (!(await model.findOne(supplyModels.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(
    await model.findOneAndUpdate(
      supplyModels.getFilter(req, { _id: req.params.id }),
      supplyModels.withScope(req, safeSupplyInput(req.body)),
      {
        new: true,
      },
    ),
  );
});

router.delete('/:id', async (req, res) => {
  const model = supplyModels.getModel(req);
  if (!(await model.findOne(supplyModels.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  await model.findOneAndUpdate(supplyModels.getFilter(req, { _id: req.params.id }), {
    $set: { deletedAt: new Date() },
  });
  res.status(204).end();
});

function safeSupplyInput(input: Record<string, unknown>) {
  const {
    factorySupplyId: _factorySupplyId,
    franchiseId: _franchiseId,
    source: _source,
    deletedAt: _deletedAt,
    ...safe
  } = input;
  return safe;
}

export default router;
