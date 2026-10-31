import mongoose, { Schema } from 'mongoose';

const PedidoItemSchema = new Schema(
  {
    id: { type: String, required: true },
    nome: { type: String, required: true },
    measure: { type: String, default: 'un' },
    quantidade: { type: Number, default: 0 },
  },
  { _id: false },
);

const PedidoIngredientSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    measure: { type: String, default: 'un' },
    neededQty: { type: Number, default: 0 },
    neededCost: { type: Number, default: 0 },
  },
  { _id: false },
);

const PizzaSizeSchema = new Schema(
  {
    id: { type: String, required: true },
    diameter: { type: Number, default: 25 },
    gramsPerPizza: { type: Number, default: 180 },
  },
  { _id: false },
);

const ProductionOrderSchema = new Schema(
  {
    unit: { type: String, required: true, index: true },
    id: { type: String, required: true },
    orderNumber: { type: Number, default: 1 },
    filial: { type: String, required: true, trim: true },
    itens: { type: [PedidoItemSchema], default: [] },
    pizzaSize: { type: PizzaSizeSchema },
    ingredients: { type: [PedidoIngredientSchema], default: [] },
    totalCost: { type: Number, default: 0 },
    accountingTreatment: { type: String, enum: ['internal_transfer', 'external_sale'], default: 'internal_transfer' },
    eventId: String,
    eventSource: { type: String, enum: ['main', 'franchise'] },
    franchiseId: { type: Schema.Types.ObjectId, ref: 'Franchise', index: true },
    eventName: String,
    eventDate: String,
    status: { type: String, default: 'a_preparar' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    deletedAt: Date,
  },
  { toJSON: { virtuals: true, versionKey: false } },
);

ProductionOrderSchema.index({ unit: 1, id: 1 }, { unique: true });
ProductionOrderSchema.index({ franchiseId: 1, createdAt: -1 });

export const ProductionOrderModel =
  mongoose.models.ProductionOrder || mongoose.model('ProductionOrder', ProductionOrderSchema);
