import { Schema } from 'mongoose';
import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';
import { logAudit } from '../utils/audit';
import { emitirNFe } from '../services/nfe-sefaz';
import { nextNumber } from '../services/nfeCounter';
import { checkCertValidity } from '../services/cert';
import { emitirNfseAsaas, consultarNfseAsaas } from '../services/asaas-nfse';

const InvoiceItemSchema = new Schema({
  description: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  ncm: { type: String, default: '' },
  cfop: { type: String, default: '' },
  unit: { type: String, default: 'UN' },
}, { _id: false });

// Lookup IBGE city code by name (SP state — expand as needed)
const IBGE_CITIES: Record<string, number> = {
  'sorocaba': 3552205,
  'sao paulo': 3550308,
  'campinas': 3509502,
  'santos': 3548100,
  'ribeirao preto': 3543402,
  'sao bernardo do campo': 3548708,
  'santo andre': 3547809,
  'osasco': 3534401,
  'guarulhos': 3518800,
  'indaiatuba': 3520509,
  'jundiai': 3525904,
  'piracicaba': 3538709,
  'limeira': 3526902,
  'bauru': 3506003,
  'marilia': 3529005,
  'presidente prudente': 3541406,
  'sao jose dos campos': 3549904,
  'sao jose do rio preto': 3549805,
};

function ibgeCity(cityName: string): { code?: number; name: string } {
  const key = cityName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const code = IBGE_CITIES[key];
  return code ? { code, name: cityName } : { name: cityName };
}

const models = createTenantModels('Invoice', {
  eventId: { type: String, default: '' },
  clientName: { type: String, default: '' },
  clientDocument: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  issueDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, default: 'rascunho' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  // Tipo e configuração fiscal
  type: { type: String, default: 'nfse' },
  serviceCode: { type: String, default: '' },

  // Endereço do tomador/destinatário
  clientAddress: { type: String, default: '' },
  clientNumber: { type: String, default: '' },
  clientDistrict: { type: String, default: '' },
  clientCity: { type: String, default: '' },
  clientState: { type: String, default: '' },
  clientPostalCode: { type: String, default: '' },

  // Emissão fiscal — campos genéricos (NF-e direto SEFAZ)
  emissaoStatus: { type: String, default: null },
  numeroNF: { type: String, default: null },
  chaveAcesso: { type: String, default: null },
  protocolo: { type: String, default: null },
  xmlEmitido: { type: String, default: null },
  emissaoMotivo: { type: String, default: null },

  // Asaas — NFS-e
  asaasPaymentId: { type: String, default: null },   // ID da cobrança no Asaas (ex: pay_xxx)
  asaasInvoiceId: { type: String, default: null },   // ID da NFS-e retornado pelo Asaas
  asaasStatus: { type: String, default: null },
  asaasPdfUrl: { type: String, default: null },
  asaasXmlUrl: { type: String, default: null },
  asaasRawResponse: { type: Object, default: null },
}, { main: 'invoices', franchise: 'franchiseinvoices', factory: 'factoryinvoices' });

// ── Helpers: document generators ─────────────────────────────────────────────

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function generateInvoiceHtml(inv: any): string {
  const isNfe = inv.type === 'nfe';
  const docType = isNfe ? 'NF-e — Nota Fiscal Eletrônica' : 'NFS-e — Nota Fiscal de Serviço Eletrônica';
  const itemsHtml = (inv.items ?? []).map((it: any) => `
    <tr>
      <td>${it.description ?? ''}</td>
      ${isNfe ? `<td>${it.ncm ?? ''}</td><td>${it.cfop ?? ''}</td>` : ''}
      <td style="text-align:right">${it.quantity ?? 1}</td>
      <td style="text-align:right">${fmtBRL(it.unitPrice ?? 0)}</td>
      <td style="text-align:right">${fmtBRL((it.quantity ?? 1) * (it.unitPrice ?? 0))}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>${docType} - ${inv.clientName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:32px}
  h1{font-size:16px;margin-bottom:4px}
  .sub{font-size:11px;color:#555;margin-bottom:24px}
  .badge{display:inline-block;background:#16a34a;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:.5px;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .section{border:1px solid #d1d5db;border-radius:6px;padding:12px}
  .section h2{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  .row{display:flex;justify-content:space-between;padding:2px 0;font-size:11px}
  .row span:first-child{color:#6b7280}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#f3f4f6;font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:6px 8px;text-align:left;border:1px solid #d1d5db}
  td{padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;vertical-align:top}
  .total{text-align:right;margin-top:12px;font-size:14px;font-weight:700}
  .chave{margin-top:16px;padding:8px 10px;background:#f9fafb;border:1px dashed #d1d5db;border-radius:4px;font-family:monospace;font-size:10px;word-break:break-all;color:#374151}
  .footer{margin-top:24px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:12px}
  @media print{body{padding:16px}.no-print{display:none!important}}
</style>
</head>
<body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:13px">Imprimir / Salvar como PDF</button>
</div>
<h1>${docType}</h1>
<div class="sub">Protocolo ${inv.protocolo ?? '—'}</div>
<div class="badge">EMITIDA — NF ${inv.numeroNF ?? '—'}</div>

<div class="grid">
  <div class="section">
    <h2>Destinatário / Tomador</h2>
    <div class="row"><span>Nome</span><strong>${inv.clientName ?? ''}</strong></div>
    <div class="row"><span>CPF/CNPJ</span><span>${inv.clientDocument ?? ''}</span></div>
    <div class="row"><span>E-mail</span><span>${inv.clientEmail ?? ''}</span></div>
    <div class="row"><span>Endereço</span><span>${[inv.clientAddress, inv.clientNumber, inv.clientDistrict].filter(Boolean).join(', ')}</span></div>
    <div class="row"><span>Cidade/UF</span><span>${inv.clientCity ?? ''}${inv.clientState ? ' - ' + inv.clientState : ''}</span></div>
    <div class="row"><span>CEP</span><span>${inv.clientPostalCode ?? ''}</span></div>
  </div>
  <div class="section">
    <h2>Dados do Documento</h2>
    <div class="row"><span>Tipo</span><strong>${isNfe ? 'NF-e (Produto)' : 'NFS-e (Serviço)'}</strong></div>
    <div class="row"><span>Número</span><span>${inv.numeroNF ?? '—'}</span></div>
    <div class="row"><span>Data Emissão</span><span>${inv.issueDate ?? ''}</span></div>
    ${!isNfe ? `<div class="row"><span>Cód. Serviço</span><span>${inv.serviceCode ?? ''}</span></div>` : ''}
    <div class="row"><span>ISS (${inv.taxRate ?? 0}%)</span><span>${fmtBRL(inv.taxAmount ?? 0)}</span></div>
    <div class="row"><span>Total</span><strong>${fmtBRL(inv.totalValue ?? 0)}</strong></div>
  </div>
</div>

<div class="section">
  <h2>${isNfe ? 'Itens do Produto' : 'Descrição do Serviço'}</h2>
  <table>
    <thead><tr>
      <th>Descrição</th>
      ${isNfe ? '<th>NCM</th><th>CFOP</th>' : ''}
      <th style="text-align:right">Qtd</th>
      <th style="text-align:right">Valor Unit.</th>
      <th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="total">Total: ${fmtBRL(inv.totalValue ?? 0)}</div>
</div>

${isNfe && inv.chaveAcesso ? `<div class="chave">Chave de Acesso NF-e: ${inv.chaveAcesso}</div>` : ''}
${inv.notes ? `<div class="section" style="margin-top:16px"><h2>Observações</h2><p style="font-size:11px;color:#374151;line-height:1.6">${inv.notes}</p></div>` : ''}

<div class="footer">
  Documento gerado pelo sistema Soul540
</div>
</body></html>`;
}

function generateInvoiceXml(inv: any): string {
  const isNfe = inv.type === 'nfe';
  const now = new Date().toISOString();

  if (isNfe) {
    const itemsXml = (inv.items ?? []).map((it: any, i: number) => `
    <det nItem="${i + 1}">
      <prod>
        <cProd>${String(i + 1).padStart(6, '0')}</cProd>
        <xProd>${it.description ?? ''}</xProd>
        <NCM>${it.ncm ?? ''}</NCM>
        <CFOP>${it.cfop ?? ''}</CFOP>
        <uCom>${it.unit ?? 'UN'}</uCom>
        <qCom>${it.quantity ?? 1}</qCom>
        <vUnCom>${(it.unitPrice ?? 0).toFixed(2)}</vUnCom>
        <vProd>${((it.quantity ?? 1) * (it.unitPrice ?? 0)).toFixed(2)}</vProd>
      </prod>
      <imposto>
        <ICMS><ICMSSN400><orig>0</orig><CSOSN>400</CSOSN></ICMSSN400></ICMS>
        <PIS><PISAliq><CST>07</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>
        <COFINS><COFINSAliq><CST>07</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>
      </imposto>
    </det>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${inv.chaveAcesso ?? '00000000000000000000000000000000000000000000'}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <natOp>Venda de produto</natOp>
        <mod>55</mod>
        <serie>001</serie>
        <nNF>${inv.numeroNF ?? '1'}</nNF>
        <dhEmi>${inv.issueDate ?? now}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3552205</cMunFG>
        <finNFe>1</finNFe>
        <tpAmb>1</tpAmb>
      </ide>
      <dest>
        <CNPJ>${(inv.clientDocument ?? '').replace(/\D/g, '')}</CNPJ>
        <xNome>${inv.clientName ?? ''}</xNome>
        <email>${inv.clientEmail ?? ''}</email>
        <enderDest>
          <xLgr>${inv.clientAddress ?? ''}</xLgr>
          <nro>${inv.clientNumber ?? ''}</nro>
          <xBairro>${inv.clientDistrict ?? ''}</xBairro>
          <xMun>${inv.clientCity ?? ''}</xMun>
          <UF>${inv.clientState ?? ''}</UF>
          <CEP>${(inv.clientPostalCode ?? '').replace(/\D/g, '')}</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderDest>
      </dest>
      ${itemsXml}
      <total>
        <ICMSTot>
          <vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST>
          <vProd>${(inv.subtotal ?? 0).toFixed(2)}</vProd>
          <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII>
          <vIPI>0.00</vIPI><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro>
          <vNF>${(inv.totalValue ?? 0).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <infAdic><infCpl>${inv.notes ?? ''}</infCpl></infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
      <chNFe>${inv.chaveAcesso ?? ''}</chNFe>
      <nProt>${inv.protocolo ?? ''}</nProt>
      <dhRecbto>${now}</dhRecbto>
    </infProt>
  </protNFe>
</nfeProc>`;
  }

  // NFS-e
  const desc = (inv.items ?? []).map((i: any) => i.description).filter(Boolean).join('; ') || inv.notes || '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<ConsultarNfseResposta xmlns="http://www.abrasf.org.br/nfse.xsd">
  <ListaNfse>
    <CompNfse>
      <Nfse versao="2.01">
        <InfNfse>
          <Numero>${inv.numeroNF ?? '1'}</Numero>
          <CodigoVerificacao>${inv.protocolo ?? ''}</CodigoVerificacao>
          <DataEmissao>${inv.issueDate ?? now}</DataEmissao>
          <Prestador>
            <RazaoSocial>Soul Negócios Eventos e Consultoria Ltda</RazaoSocial>
          </Prestador>
          <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj><${(inv.clientDocument ?? '').replace(/\D/g, '').length === 11 ? 'Cpf' : 'Cnpj'}>${(inv.clientDocument ?? '').replace(/\D/g, '')}</${(inv.clientDocument ?? '').replace(/\D/g, '').length === 11 ? 'Cpf' : 'Cnpj'}></CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${inv.clientName ?? ''}</RazaoSocial>
            <Endereco>
              <Logradouro>${inv.clientAddress ?? ''}</Logradouro>
              <Numero>${inv.clientNumber ?? ''}</Numero>
              <Bairro>${inv.clientDistrict ?? ''}</Bairro>
              <CodigoMunicipio>3552205</CodigoMunicipio>
              <Uf>${inv.clientState ?? ''}</Uf>
              <Cep>${(inv.clientPostalCode ?? '').replace(/\D/g, '')}</Cep>
            </Endereco>
            <Contato><Email>${inv.clientEmail ?? ''}</Email></Contato>
          </Tomador>
          <Servico>
            <Valores>
              <ValorServicos>${(inv.totalValue ?? 0).toFixed(2)}</ValorServicos>
              <AliquotaIss>${(inv.taxRate ?? 0).toFixed(2)}</AliquotaIss>
              <ValorIss>${(inv.taxAmount ?? 0).toFixed(2)}</ValorIss>
            </Valores>
            <ItemListaServico>${inv.serviceCode ?? ''}</ItemListaServico>
            <Discriminacao>${desc}</Discriminacao>
            <CodigoMunicipio>3552205</CodigoMunicipio>
          </Servico>
          <ValorLiquidoNfse>${(inv.totalValue ?? 0).toFixed(2)}</ValorLiquidoNfse>
        </InfNfse>
      </Nfse>
    </CompNfse>
  </ListaNfse>
</ConsultarNfseResposta>`;
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

router.get('/', async (req, res) => res.json(await models.getModel(req).find({})));

// Download endpoints — serve generated PDF (HTML printable) and XML
router.get('/:id/download/pdf', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).send('Nota fiscal não encontrada.');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(generateInvoiceHtml(inv));
});

router.get('/:id/download/xml', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).send('Nota fiscal não encontrada.');
  const filename = `NF${inv.numeroNF ?? inv._id}-${inv.type?.toUpperCase() ?? 'NF'}.xml`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(generateInvoiceXml(inv));
});

router.post('/', async (req, res) => {
  const invoice = await models.getModel(req).create({ ...req.body, source: models.getSource(req) });
  await logAudit({ req, action: 'create', resource: 'invoices', resourceId: invoice.id, description: `Criou nota fiscal: ${invoice.clientName} (R$ ${invoice.totalValue})` });
  res.status(201).json(invoice);
});

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const invoice = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'invoices', resourceId: req.params.id, description: `Atualizou nota fiscal: ${invoice?.clientName}` });
  res.json(invoice);
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const clientName = found.doc?.clientName || req.params.id;
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'invoices', resourceId: req.params.id, description: `Excluiu nota fiscal: ${clientName}` });
  res.status(204).end();
});

router.post('/:id/emit', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).json({ error: 'Not found' });

  if (!inv.clientDocument?.replace(/\D/g, '')) {
    return res.status(400).json({ error: 'CPF/CNPJ do cliente é obrigatório para emissão.' });
  }

  // ── NF-e: emissão direta no SEFAZ ────────────────────────────────────────
  if (inv.type === 'nfe') {
    const items = inv.items ?? [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'NF-e requer pelo menos um item com descrição, NCM e CFOP.' });
    }
    const missingNcmCfop = items.find((i: any) => !i.ncm || !i.cfop);
    if (missingNcmCfop) {
      return res.status(400).json({ error: `Item "${missingNcmCfop.description || 'sem descrição'}" está sem NCM ou CFOP.` });
    }
    if (!inv.clientAddress || !inv.clientCity || !inv.clientPostalCode) {
      return res.status(400).json({ error: 'Endereço completo do cliente é obrigatório para NF-e.' });
    }

    try {
      const certInfo = checkCertValidity();
      if (!certInfo.valid) {
        return res.status(503).json({ error: 'Certificado digital expirado. Renove o certificado A1.' });
      }
      if (certInfo.daysLeft < 30) {
        console.warn(`[nfe] Certificado expira em ${certInfo.daysLeft} dias.`);
      }
    } catch (err) {
      return res.status(503).json({ error: `Erro ao carregar certificado: ${String(err)}` });
    }

    try {
      const nNF = await nextNumber('nfe');
      const result = await emitirNFe(inv, nNF);

      if (result.status === 'rejeitado') {
        const updated = await model.findByIdAndUpdate(req.params.id,
          { emissaoStatus: 'erro', emissaoMotivo: result.motivo }, { new: true });
        return res.status(422).json({ error: result.motivo, invoice: updated });
      }

      const updated = await model.findByIdAndUpdate(req.params.id, {
        emissaoStatus: 'emitida',
        status: 'emitida',
        numeroNF: String(result.numeroNF),
        chaveAcesso: result.chaveAcesso,
        protocolo: result.protocolo,
        xmlEmitido: result.xmlAutorizado,
        emissaoMotivo: result.motivo,
      }, { new: true });

      await logAudit({ req, action: 'update', resource: 'invoices', resourceId: req.params.id, description: `Emitiu NF-e diretamente no SEFAZ: ${inv.clientName} (chave: ${result.chaveAcesso})` });
      return res.json(updated);

    } catch (err) {
      await model.findByIdAndUpdate(req.params.id, { emissaoStatus: 'erro', emissaoMotivo: String(err) });
      return res.status(502).json({ error: `Falha na comunicação com SEFAZ: ${String(err)}` });
    }
  }

  // ── NFS-e: emissão via Asaas ─────────────────────────────────────────────
  if (!inv.asaasPaymentId) {
    return res.status(400).json({
      error: 'Para emitir NFS-e via Asaas, informe o campo "asaasPaymentId" com o ID da cobrança no Asaas (ex: pay_xxxxxxxx).',
    });
  }

  try {
    const effectiveDate = (inv.issueDate ?? new Date().toISOString()).substring(0, 10);
    const observations = inv.notes ?? '';

    const result = await emitirNfseAsaas(
      inv.asaasPaymentId,
      effectiveDate,
      0,
      observations,
    );

    const updated = await model.findByIdAndUpdate(req.params.id, {
      asaasInvoiceId:   result.id,
      asaasStatus:      result.status,
      asaasPdfUrl:      result.pdfUrl ?? null,
      asaasXmlUrl:      result.xmlUrl ?? null,
      asaasRawResponse: result.rawResponse,
      emissaoStatus:    'processing',
    }, { new: true });

    await logAudit({ req, action: 'update', resource: 'invoices', resourceId: req.params.id, description: `Emitiu NFS-e via Asaas: ${inv.clientName} (asaasInvoiceId: ${result.id})` });
    return res.json(updated);

  } catch (err) {
    await model.findByIdAndUpdate(req.params.id, { emissaoStatus: 'erro', emissaoMotivo: String(err) });
    return res.status(502).json({ error: `Falha ao emitir NFS-e no Asaas: ${String(err)}` });
  }
});

router.get('/:id/status', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

router.get('/:id/nfse-status', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).json({ error: 'Not found' });

  if (!inv.asaasInvoiceId) {
    return res.status(400).json({ error: 'NFS-e ainda não emitida via Asaas.' });
  }

  try {
    const result = await consultarNfseAsaas(inv.asaasInvoiceId);

    const isAuthorized = result.status === 'AUTHORIZED';
    const isError = result.status === 'ERROR' || result.status === 'CANCELLED';

    const updateFields: Record<string, unknown> = {
      asaasStatus:      result.status,
      asaasRawResponse: result.rawResponse,
      emissaoStatus:    isAuthorized ? 'emitida' : isError ? 'erro' : 'processing',
    };

    if (isAuthorized) {
      updateFields.status      = 'emitida';
      updateFields.numeroNF    = result.number ?? null;
      updateFields.asaasPdfUrl = result.pdfUrl ?? null;
      updateFields.asaasXmlUrl = result.xmlUrl ?? null;
    }

    const updated = await model.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    return res.json(updated);

  } catch (err) {
    return res.status(502).json({ error: `Falha ao consultar NFS-e no Asaas: ${String(err)}` });
  }
});

export default router;
