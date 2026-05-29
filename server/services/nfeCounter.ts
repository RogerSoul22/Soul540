import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.NfeCounter || mongoose.model('NfeCounter', CounterSchema);

export async function nextNumber(type: 'nfe' | 'nfse'): Promise<number> {
  const result = await Counter.findByIdAndUpdate(
    type,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return result.seq;
}
