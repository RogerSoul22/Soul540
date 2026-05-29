import axios from 'axios';
import { SignedXml } from 'xml-crypto';
import { XMLParser } from 'fast-xml-parser';
import { loadCert } from './cert';

const SEFAZ_URLS = {
  producao:    'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
  homologacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
};

function getAmbiente(): 'producao' | 'homologacao' {
  return (process.env.NFE_AMBIENTE ?? 'homologacao') === 'producao' ? 'producao' : 'homologacao';
}

function tpAmb(): '1' | '2' {
  return getAmbiente() === 'producao' ? '1' : '2';
}

function randomCNF(): string {
  return String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
}

function calcDV(chave43: string): string {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;
  for (let i = 0; i < 43; i++) {
    sum += Number(chave43[42 - i]) * weights[i % 8];
  }
  const rem = sum % 11;
  return rem < 2 ? '0' : String(11 - rem);
}

function buildChaveAcesso(nNF: number, cNF: string): string {
  const cUF = process.env.NFE_IBGE_MUNICIPIO?.substring(0, 2) ?? '35';
  const now = new Date();
  const AAMM = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const cnpj = (process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
  const mod = '55';
  const serie = (process.env.NFE_SERIE ?? '1').padStart(3, '0');
  const nNFStr = String(nNF).padStart(9, '0');
  const tpEmis = '1';
  const chave43 = `${cUF}${AAMM}${cnpj}${mod}${serie}${nNFStr}${tpEmis}${cNF}`;
  const dv = calcDV(chave43);
  return chave43 + dv;
}

const IBGE_MAP: Record<string, string> = {
  'sorocaba': '3552205', 'sao paulo': '3550308', 'campinas': '3509502',
  'santos': '3548100', 'ribeirao preto': '3543402', 'guarulhos': '3518800',
  'jundiai': '3525904', 'piracicaba': '3538709', 'bauru': '3506003',
};

function normalizeCity(city: string): string {
  return city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function buildInfNFe(inv: any, nNF: number, chave: string): string {
  const dhEmi = new Date().toISOString().replace(/.\d{3}Z/, '-03:00');
  const cnpjEmit = (process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
  const docDest = (inv.clientDocument ?? '').replace(/\D/g, '');
  const tagDoc = docDest.length === 11 ? `<CPF>${docDest}</CPF>` : `<CNPJ>${docDest}</CNPJ>`;

  // email do dest: omitir se vazio (campo opcional no schema)
  const emailDest = inv.clientEmail?.trim()
    ? `<email>${inv.clientEmail.trim()}</email>`
    : '';

  // infAdic: omitir se vazio
  const notes = inv.notes?.trim() ?? '';
  const infAdic = notes ? `<infAdic><infCpl>${notes}</infCpl></infAdic>` : '';

  const itemsXml = (inv.items ?? []).map((it: any, i: number) => {
    const vProd = ((it.quantity ?? 1) * (it.unitPrice ?? 0)).toFixed(2);
    return `<det nItem="${i + 1}"><prod><cProd>${String(i + 1).padStart(6, '0')}</cProd><cEAN>SEM GTIN</cEAN><xProd>${it.description ?? ''}</xProd><NCM>${it.ncm ?? ''}</NCM><CFOP>${it.cfop ?? ''}</CFOP><uCom>${it.unit ?? 'UN'}</uCom><qCom>${(it.quantity ?? 1).toFixed(4)}</qCom><vUnCom>${(it.unitPrice ?? 0).toFixed(10)}</vUnCom><vProd>${vProd}</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>${it.unit ?? 'UN'}</uTrib><qTrib>${(it.quantity ?? 1).toFixed(4)}</qTrib><vUnTrib>${(it.unitPrice ?? 0).toFixed(10)}</vUnTrib><indTot>1</indTot></prod><imposto><ICMS><ICMSSN400><orig>0</orig><CSOSN>400</CSOSN></ICMSSN400></ICMS><PIS><PISNT><CST>07</CST></PISNT></PIS><COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS></imposto></det>`;
  }).join('');

  const vNF = (inv.totalValue ?? 0).toFixed(2);
  const vProd = (inv.subtotal ?? 0).toFixed(2);
  const xNomeDest = tpAmb() === '2'
    ? 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
    : (inv.clientName ?? '');
  const ibgeDest = IBGE_MAP[normalizeCity(inv.clientCity ?? '')] ?? '9999999';

  return `<infNFe xmlns="http://www.portalfiscal.inf.br/nfe" Id="NFe${chave}" versao="4.00"><ide><cUF>${chave.substring(0, 2)}</cUF><cNF>${chave.substring(35, 43)}</cNF><natOp>Venda de produto</natOp><mod>55</mod><serie>${process.env.NFE_SERIE ?? '1'}</serie><nNF>${nNF}</nNF><dhEmi>${dhEmi}</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>${process.env.NFE_IBGE_MUNICIPIO ?? '3552205'}</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${chave[43]}</cDV><tpAmb>${tpAmb()}</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>1.0.0</verProc></ide><emit><CNPJ>${cnpjEmit}</CNPJ><xNome>${process.env.NFE_RAZAO_SOCIAL ?? ''}</xNome><enderEmit><xLgr>${process.env.NFE_LOGRADOURO ?? ''}</xLgr><nro>${process.env.NFE_NUMERO ?? ''}</nro><xBairro>${process.env.NFE_BAIRRO ?? ''}</xBairro><cMun>${process.env.NFE_IBGE_MUNICIPIO ?? '3552205'}</cMun><xMun>${process.env.NFE_MUNICIPIO ?? 'Sorocaba'}</xMun><UF>${process.env.NFE_UF ?? 'SP'}</UF><CEP>${(process.env.NFE_CEP ?? '').replace(/\D/g, '')}</CEP><cPais>1058</cPais><xPais>Brasil</xPais></enderEmit><IE>ISENTO</IE><CRT>1</CRT></emit><dest>${tagDoc}<xNome>${xNomeDest}</xNome><enderDest><xLgr>${inv.clientAddress ?? ''}</xLgr><nro>${inv.clientNumber ?? ''}</nro><xBairro>${inv.clientDistrict ?? ''}</xBairro><cMun>${ibgeDest}</cMun><xMun>${inv.clientCity ?? ''}</xMun><UF>${inv.clientState ?? ''}</UF><CEP>${(inv.clientPostalCode ?? '').replace(/\D/g, '')}</CEP><cPais>1058</cPais><xPais>Brasil</xPais></enderDest><indIEDest>9</indIEDest>${emailDest}</dest>${itemsXml}<total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST><vProd>${vProd}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>${vNF}</vNF></ICMSTot></total><transp><modFrete>9</modFrete></transp><pag><detPag><tPag>90</tPag><vPag>${(inv.totalValue ?? 0).toFixed(2)}</vPag></detPag></pag>${infAdic}</infNFe>`;
}

function signNFe(infNFeXml: string): string {
  const { keyPem, certPem, certDer } = loadCert();
  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">${infNFeXml}</NFe>`;
  const sig = new SignedXml();
  (sig as any).privateKey = keyPem;
  (sig as any).publicCert = certPem;
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  const idMatch = infNFeXml.match(/Id="(NFe\d{44})"/);
  if (!idMatch) throw new Error('Id nao encontrado no infNFe.');
  const refId = idMatch[1];
  sig.addReference({
    xpath: `//*[@Id='${refId}']`,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  } as any);
  sig.computeSignature(nfe);
  const signed = sig.getSignedXml();
  return signed.replace(
    '<X509Data/>',
    `<X509Data><X509Certificate>${certDer}</X509Certificate></X509Data>`,
  );
}

function buildSoapEnvelope(nfeXml: string, lote: number): string {
  const envXml = `<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><idLote>${lote}</idLote><indSinc>1</indSinc>${nfeXml}</enviNFe>`;
  return `<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><env:Header/><env:Body><nfe:nfeDadosMsg>${envXml}</nfe:nfeDadosMsg></env:Body></env:Envelope>`;
}

export interface NFeResult {
  chaveAcesso: string;
  protocolo: string;
  numeroNF: number;
  xmlAutorizado: string;
  status: 'autorizado' | 'rejeitado' | 'erro';
  motivo: string;
}

export async function emitirNFe(inv: any, nNF: number): Promise<NFeResult> {
  const cNF = randomCNF();
  const chave = buildChaveAcesso(nNF, cNF);
  const infNFeXml = buildInfNFe(inv, nNF, chave);
  const nfeAssinada = signNFe(infNFeXml);
  const soapBody = buildSoapEnvelope(nfeAssinada, Date.now());

  const url = SEFAZ_URLS[getAmbiente()];
  const { keyPem, certPem } = loadCert();

  const https = require('https') as typeof import('https');
  const response = await axios.post(url, soapBody, {
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote"',
    },
    httpsAgent: new https.Agent({
      key: keyPem,
      cert: certPem,
      rejectUnauthorized: false,
    }),
    timeout: 30000,
  });

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(response.data);

  // SEFAZ retorna soap:Envelope (SOAP 1.2)
  const env = parsed?.['soap:Envelope'] ?? parsed?.['env:Envelope'] ?? parsed?.Envelope ?? {};
  const body = env?.['soap:Body'] ?? env?.['env:Body'] ?? env?.Body ?? {};
  const nfeResult = body?.['nfeResultMsg'] ?? body?.nfeResultMsg ?? {};
  const retEnv = nfeResult?.retEnviNFe ?? nfeResult;
  const protNFe = retEnv?.protNFe?.infProt;

  const cStat = String(protNFe?.cStat ?? retEnv?.cStat ?? '');
  const xMotivo = String(protNFe?.xMotivo ?? retEnv?.xMotivo ?? '');
  const nProt = String(protNFe?.nProt ?? '');

  if (cStat === '100') {
    return {
      chaveAcesso: chave,
      protocolo: nProt,
      numeroNF: nNF,
      xmlAutorizado: nfeAssinada,
      status: 'autorizado',
      motivo: xMotivo,
    };
  }

  return {
    chaveAcesso: chave,
    protocolo: '',
    numeroNF: nNF,
    xmlAutorizado: '',
    status: 'rejeitado',
    motivo: `${cStat} - ${xMotivo}`,
  };
}
