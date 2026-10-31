import { Router } from 'express';
import { logAudit } from '../../infrastructure/audit-log';
import { models } from './invoices.model';
import { generateInvoiceHtml } from './invoices-html';
import { generateInvoiceXml } from './invoices-xml';
import emissionRouter from './invoices-emission.routes';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const router = Router();
router.use(requirePermission('notas-fiscais', 'read'));
router.get('/', async (req, res) => res.json(await models.getModel(req).find(models.getFilter(req))));

// Download endpoints — serve generated PDF (HTML printable) and XML
router.get('/:id/download/pdf', async (req, res) => {
  const model = models.getModel(req);
  const inv = (await model.findOne(models.getFilter(req, { _id: req.params.id }))) as any;
  if (!inv) return res.status(404).send('Nota fiscal não encontrada.');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(generateInvoiceHtml(inv));
});

router.get('/:id/download/xml', async (req, res) => {
  const model = models.getModel(req);
  const inv = (await model.findOne(models.getFilter(req, { _id: req.params.id }))) as any;
  if (!inv) return res.status(404).send('Nota fiscal não encontrada.');
  const filename = `NF${inv.numeroNF ?? inv._id}-${inv.type?.toUpperCase() ?? 'NF'}.xml`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(generateInvoiceXml(inv));
});

router.post('/', requirePermission('notas-fiscais', 'write'), async (req, res) => {
  const invoice = await models.getModel(req).create({
    ...models.withScope(req, req.body),
    source: models.getSource(req),
  });
  await logAudit({
    req,
    action: 'create',
    resource: 'invoices',
    resourceId: invoice.id,
    description: `Criou nota fiscal: ${invoice.clientName} (R$ ${invoice.totalValue})`,
  });
  res.status(201).json(invoice);
});

router.put('/:id', requirePermission('notas-fiscais', 'write'), async (req, res) => {
  const model = models.getModel(req);
  if (!(await model.findOne(models.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  const invoice = await model.findOneAndUpdate(
    models.getFilter(req, { _id: req.params.id }),
    models.withScope(req, req.body),
    { new: true },
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'invoices',
    resourceId: req.params.id,
    description: `Atualizou nota fiscal: ${invoice?.clientName}`,
  });
  res.json(invoice);
});

router.delete('/:id', requirePermission('notas-fiscais', 'write'), async (req, res) => {
  const model = models.getModel(req);
  const invoice = await model.findOne(models.getFilter(req, { _id: req.params.id }));
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  const clientName = invoice.clientName || req.params.id;
  await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), { $set: { deletedAt: new Date() } });
  await logAudit({
    req,
    action: 'delete',
    resource: 'invoices',
    resourceId: req.params.id,
    description: `Excluiu nota fiscal: ${clientName}`,
  });
  res.status(204).end();
});

router.use(emissionRouter);

export default router;
