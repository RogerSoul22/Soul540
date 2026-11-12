import { Router } from 'express';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { ProductionRecipeModel } from './production-recipes.model';

const router = Router();
router.use(requirePermission('tarefas', 'read'));

export function getProductionRecipeUnit(req: any): string {
  return getTenantUnit(req);
}

router.get('/', async (req, res) => {
  const unit = getProductionRecipeUnit(req);
  let doc = await ProductionRecipeModel.findOne({ unit });
  if (!doc) {
    doc = await ProductionRecipeModel.create({
      unit,
      ingredients: [
        { id: '1', name: 'Farinha', measure: 'kg', quantity: 0.6, cost: 0 },
        { id: '2', name: 'Água', measure: 'L', quantity: 0.35, cost: 0 },
        { id: '3', name: 'Sal', measure: 'g', quantity: 10, cost: 0 },
        { id: '4', name: 'Fermento', measure: 'g', quantity: 5, cost: 0 },
        { id: '5', name: 'Azeite', measure: 'ml', quantity: 20, cost: 0 },
      ],
      sizes: [
        { id: '1', diameter: 25, gramsPerPizza: 180 },
        { id: '2', diameter: 35, gramsPerPizza: 350 },
      ],
    });
  }
  res.json(doc);
});

router.put('/', requirePermission('tarefas', 'write'), async (req, res) => {
  const unit = getProductionRecipeUnit(req);
  const { ingredients, insumos, sizes } = req.body;
  const doc = await ProductionRecipeModel.findOneAndUpdate(
    { unit },
    { ingredients, insumos: insumos || [], sizes: sizes || [] },
    { upsert: true, new: true },
  );
  res.json(doc);
});

export default router;
