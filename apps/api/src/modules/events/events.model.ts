import mongoose from 'mongoose';
import { EventSchema, FactoryEventSchema, FranchiseEventSchema } from './events.schemas';

EventSchema.index({ date: -1 });
EventSchema.index({ status: 1, date: -1 });
FranchiseEventSchema.index({ date: -1 });
FranchiseEventSchema.index({ status: 1, date: -1 });
FranchiseEventSchema.index({ franchiseId: 1, date: -1 });
FactoryEventSchema.index({ date: -1 });
FactoryEventSchema.index({ status: 1, date: -1 });

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const FranchiseEvent = mongoose.models.FranchiseEvent || mongoose.model('FranchiseEvent', FranchiseEventSchema);
export const FactoryEvent = mongoose.models.FactoryEvent || mongoose.model('FactoryEvent', FactoryEventSchema);
