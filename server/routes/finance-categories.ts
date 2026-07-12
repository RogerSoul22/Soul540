import { Router } from 'express';
import mongoose from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';
import { logAudit } from '../utils/audit';
import { Finance, FranchiseFinance, FactoryFinance } from './finances';

const DRE_SECTION_KEYS = [
  'faturamentos',
  'deducoes',
  'custos-operacionais',
  'despesas-logistica',
  'despesas-administrativas',
  'despesas-comerciais',
  'despesas-financeiras',
  'receitas-nao-operacionais',
  'outras-saidas',
];

function buildSchema(defaultSource: string) {
  return new mongoose.Schema(
    {
      key: { type: String, required: true },
      label: { type: String, required: true },
      type: { type: String, enum: ['revenue', 'cost'], required: true },
      section: { type: String, enum: DRE_SECTION_KEYS, required: true },
      color: { type: String, default: '#64748b' },
      source: { type: String, default: defaultSource },
    },
    { toJSON: { virtuals: true, versionKey: false }, id: true },
  );
}

const FinanceCategory = mongoose.models.FinanceCategory ||
  mongoose.model('FinanceCategory', buildSchema('main'), 'financecategories');
const FranchiseFinanceCategory = mongoose.models.FranchiseFinanceCategory ||
  mongoose.model('FranchiseFinanceCategory', buildSchema('franchise'), 'franchisefinancecategories');
const FactoryFinanceCategory = mongoose.models.FactoryFinanceCategory ||
  mongoose.model('FactoryFinanceCategory', buildSchema('factory'), 'factoryfinancecategories');

function getModel(req: any) {
  const unit = getTenantUnit(req);
  if (unit === 'factory') return FactoryFinanceCategory;
  if (unit === 'franchise') return FranchiseFinanceCategory;
  return FinanceCategory;
}

function getFinanceModel(req: any) {
  const unit = getTenantUnit(req);
  if (unit === 'factory') return FactoryFinance;
  if (unit === 'franchise') return FranchiseFinance;
  return Finance;
}

function canManageFinanceCategories(req: any) {
  const user = req.user;
  return Boolean(user && (user.isAdmin || user.permissions?.includes('financeiro')));
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const router = Router();

router.get('/', async (req, res) => {
  const items = await getModel(req).find().sort({ label: 1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  if (!(req as any).user) return res.status(401).json({ error: 'authentication_required' });
  if (!canManageFinanceCategories(req)) return res.status(403).json({ error: 'forbidden' });

  const { label, type, section, color } = req.body || {};
  if (!label?.trim()) return res.status(400).json({ error: 'label obrigatorio' });
  if (!['revenue', 'cost'].includes(type)) return res.status(400).json({ error: 'type invalido' });
  if (!DRE_SECTION_KEYS.includes(section)) return res.status(400).json({ error: 'section invalida' });
  const revenueSection = section === 'faturamentos' || section === 'receitas-nao-operacionais';
  if ((type === 'revenue') !== revenueSection) return res.status(400).json({ error: 'section_incompatible_with_type' });

  const key = `custom-${slugify(label)}`;
  const Model = getModel(req);
  const existing = await Model.findOne({ key });
  if (existing) return res.status(201).json(existing);

  const created = await Model.create({ key, label: label.trim(), type, section, color: color || '#64748b' });
  await logAudit({ req, action: 'create', resource: 'finance-categories', resourceId: created.id, description: `Criou categoria financeira: ${created.label}` });
  res.status(201).json(created);
});

router.delete('/:id', async (req, res) => {
  if (!(req as any).user) return res.status(401).json({ error: 'authentication_required' });
  if (!canManageFinanceCategories(req)) return res.status(403).json({ error: 'forbidden' });

  const Model = getModel(req);
  const doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });

  const inUse = await getFinanceModel(req).countDocuments({
    category: (doc as any).key,
    source: getTenantUnit(req),
  });
  if (inUse > 0) return res.status(409).json({ error: 'category_in_use', count: inUse });

  await Model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'finance-categories', resourceId: req.params.id, description: `Excluiu categoria financeira: ${(doc as any).label}` });
  res.status(204).end();
});

export default router;
