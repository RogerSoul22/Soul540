import mongoose from 'mongoose';
import { FactoryFinanceSchema, FinanceSchema, FranchiseFinanceSchema } from './finance.schemas';

FinanceSchema.index({ source: 1, date: -1 });
FinanceSchema.index({ eventId: 1 });
FinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });
FranchiseFinanceSchema.index({ source: 1, date: -1 });
FranchiseFinanceSchema.index({ franchiseId: 1, date: -1 });
FranchiseFinanceSchema.index({ eventId: 1 });
FranchiseFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FranchiseFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FranchiseFinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });
FactoryFinanceSchema.index({ source: 1, date: -1 });
FactoryFinanceSchema.index({ eventId: 1 });
FactoryFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FactoryFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FactoryFinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });

export const Finance = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);
export const FranchiseFinance =
  mongoose.models.FranchiseFinance || mongoose.model('FranchiseFinance', FranchiseFinanceSchema);
export const FactoryFinance = mongoose.models.FactoryFinance || mongoose.model('FactoryFinance', FactoryFinanceSchema);
