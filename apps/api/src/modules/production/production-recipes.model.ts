import mongoose, { Schema, type Model } from 'mongoose';

type ProductionRecipe = {
  unit: string;
  insumos: Array<{ id?: string; name?: string; measure?: string; cost?: number }>;
};

const IngredientSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, default: '' },
    measure: { type: String, default: 'kg' },
    quantity: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  },
  { _id: false },
);

const InsumoSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, default: '' },
    measure: { type: String, default: 'un' },
    cost: { type: Number, default: 0 },
  },
  { _id: false },
);

const PizzaSizeSchema = new Schema(
  {
    id: { type: String },
    diameter: { type: Number, default: 25 },
    gramsPerPizza: { type: Number, default: 180 },
  },
  { _id: false },
);

const RecipeSchema = new Schema(
  {
    unit: { type: String, required: true, unique: true },
    ingredients: { type: [IngredientSchema], default: [] },
    insumos: { type: [InsumoSchema], default: [] },
    sizes: { type: [PizzaSizeSchema], default: [] },
  },
  { toJSON: { virtuals: true, versionKey: false } },
);

export const ProductionRecipeModel: Model<ProductionRecipe> =
  (mongoose.models.ProductionRecipe as Model<ProductionRecipe> | undefined) ||
  mongoose.model<ProductionRecipe>('ProductionRecipe', RecipeSchema);
