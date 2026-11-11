import mongoose, { Schema } from 'mongoose';

const SupplyOrderItemSchema = new Schema(
  {
    factorySupplyId: { type: String, required: true },
    factorySupplyName: { type: String, required: true },
    measureUnit: { type: String, required: true },
    quantityRequested: { type: Number, required: true, min: 0 },
    quantityToDispatch: { type: Number, default: 0, min: 0 },
    quantityReceived: { type: Number, min: 0 },
    franchiseSupplyId: String,
  },
  { _id: false },
);

const SupplyOrderHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    actorName: { type: String, required: true },
    actorUnit: { type: String, required: true },
    at: { type: String, required: true },
    note: String,
  },
  { _id: false },
);

const SupplyOrderSchema = new Schema(
  {
    unit: { type: String, enum: ['main', 'franchise'], required: true, index: true },
    franchiseId: { type: Schema.Types.ObjectId, ref: 'Franchise', index: true },
    franchiseName: { type: String, required: true },
    status: {
      type: String,
      enum: ['submitted', 'preparing', 'dispatched', 'received', 'received_with_difference', 'cancelled'],
      required: true,
    },
    items: { type: [SupplyOrderItemSchema], required: true },
    note: String,
    history: { type: [SupplyOrderHistorySchema], default: [] },
    dispatchKey: String,
    receiptKey: String,
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    deletedAt: Date,
  },
  { collection: 'supplyorders', toJSON: { virtuals: true, versionKey: false } },
);

SupplyOrderSchema.index({ franchiseId: 1, createdAt: -1 });
SupplyOrderSchema.index({ status: 1, createdAt: -1 });

export const SupplyOrderModel = mongoose.models.SupplyOrder || mongoose.model('SupplyOrder', SupplyOrderSchema);
