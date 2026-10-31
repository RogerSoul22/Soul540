import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { loadCert } from './cert';
import { buildChaveAcesso, buildInfNFe, buildSoapEnvelope, getAmbiente, randomCNF, signNFe } from './nfe-xml';
import type { OpenedMainCertificate } from '../../modules/fiscal/main-certificate-types';

const SEFAZ_URLS = {
  producao: 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
  homologacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
};

export interface NFeResult {
  chaveAcesso: string;
  protocolo: string;
  numeroNF: number;
  xmlAutorizado: string;
  status: 'autorizado' | 'rejeitado' | 'erro';
  motivo: string;
}

export async function emitirNFe(inv: any, nNF: number, certificate: OpenedMainCertificate): Promise<NFeResult> {
  const cNF = randomCNF();
  const chave = buildChaveAcesso(nNF, cNF);
  const infNFeXml = buildInfNFe(inv, nNF, chave);
  const nfeAssinada = signNFe(infNFeXml, certificate);
  const soapBody = buildSoapEnvelope(nfeAssinada, Date.now());

  const url = SEFAZ_URLS[getAmbiente()];
  const { keyPem, certPem } = loadCert(certificate);

  const https = require('https') as typeof import('https');
  const response = await axios.post(url, soapBody, {
    headers: {
      'Content-Type':
        'application/soap+xml; charset=utf-8; ' +
        'action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote"',
    },
    httpsAgent: new https.Agent({
      key: keyPem,
      cert: certPem,
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
