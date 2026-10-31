import { Router } from 'express';
import { logAudit } from '../../infrastructure/audit-log';
import { emitirNFe } from '../../infrastructure/services/nfe-sefaz';
import { nextNumber } from '../../infrastructure/services/nfeCounter';
import { getMainCertificateService } from '../fiscal/main-certificate.service';
import { assertMainNfeScope } from './nfe-emission-policy';
import { emitirNfseAsaas, consultarNfseAsaas } from '../../infrastructure/services/asaas-nfse';
import { models } from './invoices.model';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const router = Router();
router.use(requirePermission('notas-fiscais', 'write'));

router.post('/:id/emit', async (req, res) => {
  const model = models.getModel(req);
  const inv = (await model.findOne(models.getFilter(req, { _id: req.params.id }))) as any;
  if (!inv) return res.status(404).json({ error: 'Nota não encontrada.' });
  if (!inv.clientDocument?.replace(/\D/g, '')) {
    return res.status(400).json({ error: 'CPF/CNPJ do cliente é obrigatório para emissão.' });
  }

  if (inv.type === 'nfe') {
    const items = inv.items ?? [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'NF-e requer pelo menos um item com descrição, NCM e CFOP.' });
    }
    const missingNcmCfop = items.find((i: any) => !i.ncm || !i.cfop);
    if (missingNcmCfop) {
      const description = missingNcmCfop.description || 'sem descrição';
      return res.status(400).json({ error: `Item "${description}" está sem NCM ou CFOP.` });
    }
    if (!inv.clientAddress || !inv.clientCity || !inv.clientPostalCode) {
      return res.status(400).json({ error: 'Endereço completo do cliente é obrigatório para NF-e.' });
    }

    try {
      assertMainNfeScope(req);
    } catch {
      return res.status(403).json({ error: 'A emissão de NF-e ocorre somente no sistema principal.' });
    }

    let certificate;
    try {
      certificate = await getMainCertificateService().openMainCertificate();
      const daysLeft = Math.floor((certificate.validUntil.getTime() - Date.now()) / 86400000);
      if (daysLeft < 30) console.warn(`[nfe] Certificado expira em ${daysLeft} dias.`);
    } catch {
      return res.status(503).json({ error: 'Certificado digital da matriz não está disponível para emissão.' });
    }

    try {
      const nNF = await nextNumber('nfe');
      const result = await emitirNFe(inv, nNF, certificate);
      if (result.status === 'rejeitado') {
        const updated = await model.findOneAndUpdate(
          models.getFilter(req, { _id: req.params.id }),
          { emissaoStatus: 'erro', emissaoMotivo: result.motivo },
          { new: true },
        );
        return res.status(422).json({ error: result.motivo, invoice: updated });
      }

      const updated = await model.findOneAndUpdate(
        models.getFilter(req, { _id: req.params.id }),
        {
          emissaoStatus: 'emitida',
          status: 'emitida',
          numeroNF: String(result.numeroNF),
          chaveAcesso: result.chaveAcesso,
          protocolo: result.protocolo,
          xmlEmitido: result.xmlAutorizado,
          emissaoMotivo: result.motivo,
        },
        { new: true },
      );
      await logAudit({
        req,
        action: 'update',
        resource: 'invoices',
        resourceId: req.params.id,
        description: `Emitiu NF-e diretamente no SEFAZ: ${inv.clientName} (chave: ${result.chaveAcesso})`,
      });
      return res.json(updated);
    } catch {
      await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), {
        emissaoStatus: 'erro',
        emissaoMotivo: 'Falha na comunicação com o SEFAZ.',
      });
      return res.status(502).json({ error: 'Falha na comunicação com o SEFAZ.' });
    }
  }

  if (!inv.asaasPaymentId) {
    return res.status(400).json({
      error:
        'Para emitir NFS-e via Asaas, informe o campo "asaasPaymentId" com o ID da cobrança ' +
        'no Asaas (ex: pay_xxxxxxxx).',
    });
  }

  try {
    const effectiveDate = (inv.issueDate ?? new Date().toISOString()).substring(0, 10);
    const result = await emitirNfseAsaas(inv.asaasPaymentId, effectiveDate, 0, inv.notes ?? '');
    const updated = await model.findOneAndUpdate(
      models.getFilter(req, { _id: req.params.id }),
      {
        asaasInvoiceId: result.id,
        asaasStatus: result.status,
        asaasPdfUrl: result.pdfUrl ?? null,
        asaasXmlUrl: result.xmlUrl ?? null,
        asaasRawResponse: result.rawResponse,
        emissaoStatus: 'processing',
      },
      { new: true },
    );
    await logAudit({
      req,
      action: 'update',
      resource: 'invoices',
      resourceId: req.params.id,
      description: `Emitiu NFS-e via Asaas: ${inv.clientName} (asaasInvoiceId: ${result.id})`,
    });
    return res.json(updated);
  } catch {
    await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), {
      emissaoStatus: 'erro',
      emissaoMotivo: 'Falha ao emitir NFS-e no Asaas.',
    });
    return res.status(502).json({ error: 'Falha ao emitir NFS-e no Asaas.' });
  }
});

router.get('/:id/nfse-status', async (req, res) => {
  const model = models.getModel(req);
  const inv = (await model.findOne(models.getFilter(req, { _id: req.params.id }))) as any;
  if (!inv) return res.status(404).json({ error: 'Nota não encontrada.' });
  if (!inv.asaasInvoiceId) return res.status(400).json({ error: 'NFS-e ainda não emitida via Asaas.' });

  try {
    const result = await consultarNfseAsaas(inv.asaasInvoiceId);
    const isAuthorized = result.status === 'AUTHORIZED';
    const isError = result.status === 'ERROR' || result.status === 'CANCELLED';
    const updateFields: Record<string, unknown> = {
      asaasStatus: result.status,
      asaasRawResponse: result.rawResponse,
      emissaoStatus: isAuthorized ? 'emitida' : isError ? 'erro' : 'processing',
    };
    if (isAuthorized) {
      updateFields.status = 'emitida';
      updateFields.numeroNF = result.number ?? null;
      updateFields.asaasPdfUrl = result.pdfUrl ?? null;
      updateFields.asaasXmlUrl = result.xmlUrl ?? null;
    }
    const updated = await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), updateFields, {
      new: true,
    });
    return res.json(updated);
  } catch {
    return res.status(502).json({ error: 'Falha ao consultar NFS-e no Asaas.' });
  }
});

export default router;
