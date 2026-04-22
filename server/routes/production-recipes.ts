import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';

const IngredientSchema = new Schema({
  id: { type: String },
  name: { type: String, default: '' },
  measure: { type: String, default: 'kg' },
  quantity: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
}, { _id: false });

const PizzaSizeSchema = new Schema({
  id: { type: String },
  diameter: { type: Number, default: 25 },
  gramsPerPizza: { type: Number, default: 180 },
}, { _id: false });

const RecipeSchema = new Schema({
  unit: { type: String, required: true, unique: true },
  ingredients: { type: [IngredientSchema], default: [] },
  sizes: { type: [PizzaSizeSchema], default: [] },
}, { toJSON: { virtuals: true, versionKey: false } });

const RecipeModel = mongoose.models.ProductionRecipe ||
  mongoose.model('ProductionRecipe', RecipeSchema);

const router = Router();

router.get('/', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  let doc = await RecipeModel.findOne({ unit });
  if (!doc) {
    doc = await RecipeModel.create({
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

router.put('/', async (req, res) => {
  const unit = (req as any).headers?.['x-system'] || 'factory';
  const { ingredients, sizes } = req.body;
  const doc = await RecipeModel.findOneAndUpdate(
    { unit },
    { ingredients, sizes },
    { upsert: true, new: true },
  );
  res.json(doc);
});

export default router;
