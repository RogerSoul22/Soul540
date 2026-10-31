// ── Helpers: document generators ─────────────────────────────────────────────

export function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function generateInvoiceHtml(inv: any): string {
  const isNfe = inv.type === 'nfe';
  const docType = isNfe ? 'NF-e — Nota Fiscal Eletrônica' : 'NFS-e — Nota Fiscal de Serviço Eletrônica';
  const itemsHtml = (inv.items ?? [])
    .map(
      (it: any) => `
    <tr>
      <td>${it.description ?? ''}</td>
      ${isNfe ? `<td>${it.ncm ?? ''}</td><td>${it.cfop ?? ''}</td>` : ''}
      <td style="text-align:right">${it.quantity ?? 1}</td>
      <td style="text-align:right">${fmtBRL(it.unitPrice ?? 0)}</td>
      <td style="text-align:right">${fmtBRL((it.quantity ?? 1) * (it.unitPrice ?? 0))}</td>
    </tr>`,
    )
    .join('');

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
  .badge{display:inline-block;background:#16a34a;color:#fff;
    font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:.5px;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .section{border:1px solid #d1d5db;border-radius:6px;padding:12px}
  .section h2{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;
    margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  .row{display:flex;justify-content:space-between;padding:2px 0;font-size:11px}
  .row span:first-child{color:#6b7280}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#f3f4f6;font-size:10px;text-transform:uppercase;letter-spacing:.5px;
    padding:6px 8px;text-align:left;border:1px solid #d1d5db}
  td{padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;vertical-align:top}
  .total{text-align:right;margin-top:12px;font-size:14px;font-weight:700}
  .chave{margin-top:16px;padding:8px 10px;background:#f9fafb;border:1px dashed #d1d5db;
    border-radius:4px;font-family:monospace;font-size:10px;word-break:break-all;color:#374151}
  .footer{margin-top:24px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:12px}
  @media print{body{padding:16px}.no-print{display:none!important}}
</style>
</head>
<body>
<div class="no-print" style="margin-bottom:20px">
  <button onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;padding:8px 20px;
    border-radius:6px;cursor:pointer;font-size:13px">Imprimir / Salvar como PDF</button>
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
    <div class="row"><span>Endereço</span>
      <span>${[inv.clientAddress, inv.clientNumber, inv.clientDistrict].filter(Boolean).join(', ')}</span></div>
    <div class="row"><span>Cidade/UF</span>
      <span>${inv.clientCity ?? ''}${inv.clientState ? ' - ' + inv.clientState : ''}</span></div>
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
${
  inv.notes
    ? `<div class="section" style="margin-top:16px"><h2>Observações</h2>
  <p style="font-size:11px;color:#374151;line-height:1.6">${inv.notes}</p></div>`
    : ''
}

<div class="footer">
  Documento gerado pelo sistema Soul540
</div>
</body></html>`;
}
