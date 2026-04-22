import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';

const PedidoItemSchema = new Schema({
  id: { type: String, required: true },
  nome: { type: String, required: true },
  measure: { type: String, default: 'un' },
  quantidade: { type: Number, default: 0 },
}, { _id: false });

const PedidoIngredientSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  measure: { type: String, default: 'un' },
  neededQty: { type: Number, default: 0 },
  neededCost: { type: Number, default: 0 },
}, { _id: false });

const PizzaSizeSchema = new Schema({
  id: { type: String, required: true },
  diameter: { type: Number, default: 25 },
  gramsPerPizza: { type: Number, default: 180 },
}, { _id: false });

const ProductionOrderSchema = new Schema({
  unit: { type: String, required: true, index: true },
  id: { type: String, required: true },
  filial: { type: String, required: true, trim: true },
  itens: { type: [PedidoItemSchema], default: [] },
  pizzaSize: { type: PizzaSizeSchema, required: true },
  ingredients: { type: [PedidoIngredientSchema], default: [] },
  totalCost: { type: Number, default: 0 },
  status: { type: String, default: 'a_preparar' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

ProductionOrderSchema.index({ unit: 1, id: 1 }, { unique: true });

const ProductionOrderModel = mongoose.models.ProductionOrder ||
  mongoose.model('ProductionOrder', ProductionOrderSchema);

const router = Router();

router.get('/', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  const docs = await ProductionOrderModel.find({ unit }).sort({ createdAt: -1 });
  res.json(docs);
});

router.post('/', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  const doc = await ProductionOrderModel.create({
    ...req.body,
    unit,
    status: req.body.status || 'a_preparar',
    createdAt: req.body.createdAt || new Date().toISOString(),
  });
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  const doc = await ProductionOrderModel.findOneAndUpdate(
    { unit, id: req.params.id },
    req.body,
    { new: true },
  );

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  const doc = await ProductionOrderModel.findOneAndDelete({ unit, id: req.params.id });

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.status(204).end();
});

export default router;
