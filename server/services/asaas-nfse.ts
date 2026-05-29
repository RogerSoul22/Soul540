/**
 * Asaas — emissão de NFS-e
 *
 * Fluxo: a invoice do sistema precisa ter um `asaasPaymentId` (ID da cobrança
 * no Asaas). O Asaas emite a NFS-e vinculada a esse pagamento, comunicando-se
 * diretamente com a prefeitura (credenciais configuradas no painel Asaas).
 *
 * Docs: https://docs.asaas.com/reference/emitir-nota-fiscal
 */

const ASAAS_BASE = {
  sandbox:    'https://sandbox.asaas.com/api/v3',
  production: 'https://www.asaas.com/api/v3',
};

function asaasBase(): string {
  return ASAAS_BASE[
    (process.env.ASAAS_ENV ?? 'sandbox') === 'production' ? 'production' : 'sandbox'
  ];
}

function asaasHeaders(): Record<string, string> {
  const key = process.env.ASAAS_API_KEY;
  if (!key || key === 'sua-chave-api-asaas') {
    throw new Error('ASAAS_API_KEY não configurada no .env.');
  }
  return {
    'access_token': key,
    'Content-Type': 'application/json',
  };
}

export interface AsaasNfseResult {
  id: string;
  status: 'SCHEDULED' | 'AUTHORIZED' | 'ERROR' | 'CANCELLED' | string;
  number?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  observations?: string;
  rawResponse: Record<string, unknown>;
}

/**
 * Emite NFS-e no Asaas vinculada a uma cobrança existente.
 * @param asaasPaymentId  ID da cobrança no Asaas (ex: "pay_xxxxxxxx")
 * @param effectiveDate   Data de emissão no formato YYYY-MM-DD
 * @param deductions      Valor de deduções (padrão 0)
 * @param observations    Observações adicionais
 */
export async function emitirNfseAsaas(
  asaasPaymentId: string,
  effectiveDate: string,
  deductions = 0,
  observations = '',
): Promise<AsaasNfseResult> {
  const url = `${asaasBase()}/invoices`;
  const payload: Record<string, unknown> = {
    payment: asaasPaymentId,
    deductions,
    effectiveDate,
  };
  if (observations) payload.observations = observations;

  const res = await fetch(url, {
    method: 'POST',
    headers: asaasHeaders(),
    body: JSON.stringify(payload),
  });

  const rawText = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(rawText); } catch { data = { message: rawText }; }

  if (!res.ok) {
    const msg = (data as any)?.errors?.[0]?.description
      ?? (data as any)?.message
      ?? `Asaas HTTP ${res.status}`;
    throw new Error(msg);
  }

  return {
    id:          String(data.id ?? ''),
    status:      String(data.status ?? ''),
    number:      data.number != null ? String(data.number) : undefined,
    pdfUrl:      data.pdfUrl != null ? String(data.pdfUrl) : undefined,
    xmlUrl:      data.xmlUrl != null ? String(data.xmlUrl) : undefined,
    observations: data.observations != null ? String(data.observations) : undefined,
    rawResponse: data,
  };
}

/**
 * Consulta o status de uma NFS-e emitida no Asaas.
 * @param asaasInvoiceId  ID retornado pela emissão (campo `id` do AsaasNfseResult)
 */
export async function consultarNfseAsaas(asaasInvoiceId: string): Promise<AsaasNfseResult> {
  const url = `${asaasBase()}/invoices/${asaasInvoiceId}`;

  const res = await fetch(url, { headers: asaasHeaders() });
  const rawText = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(rawText); } catch { data = { message: rawText }; }

  if (!res.ok) {
    const msg = (data as any)?.errors?.[0]?.description
      ?? (data as any)?.message
      ?? `Asaas HTTP ${res.status}`;
    throw new Error(msg);
  }

  return {
    id:          String(data.id ?? ''),
    status:      String(data.status ?? ''),
    number:      data.number != null ? String(data.number) : undefined,
    pdfUrl:      data.pdfUrl != null ? String(data.pdfUrl) : undefined,
    xmlUrl:      data.xmlUrl != null ? String(data.xmlUrl) : undefined,
    observations: data.observations != null ? String(data.observations) : undefined,
    rawResponse: data,
  };
}
