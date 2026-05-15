# NF-e/NFS-e Self-Hosted em Node.js — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Substituir nfe.io por comunicação direta com SEFAZ (NF-e) e prefeituras DSF (NFS-e) dentro do servidor Node.js existente, eliminando custos recorrentes.

**Architecture:** `cert.ts` carrega o certificado A1 da env var base64. `nfe-sefaz.ts` constrói e assina o XML NF-e, envia via SOAP para o SEFAZ-SP, e retorna chave de acesso + protocolo. `nfse-dsf.ts` faz o mesmo para NFS-e usando o protocolo DSF das prefeituras de Sorocaba e Campinas.

**Tech Stack:** Node.js/TypeScript, `node-forge` (parse certificado A1), `xml-crypto` (assinatura xmldsig), `axios` (SOAP HTTP), `fast-xml-parser` (parse resposta XML), MongoDB (contador de numeração NF).

---

## Novas variáveis de ambiente necessárias

Adicionar ao `.env` e ao container no Coolify antes de testar:

```env
# Certificado digital A1
NFE_CERT_BASE64=<base64 do arquivo .pfx>
NFE_CERT_PASSWORD=<senha do certificado>

# Ambiente: "producao" ou "homologacao"
NFE_AMBIENTE=homologacao

# Dados da empresa emissora
NFE_CNPJ=00000000000000
NFE_RAZAO_SOCIAL=Soul 540 Pizzas e Eventos LTDA
NFE_INSCRICAO_MUNICIPAL=000000
NFE_LOGRADOURO=Rua Exemplo
NFE_NUMERO=100
NFE_BAIRRO=Centro
NFE_MUNICIPIO=Sorocaba
NFE_UF=SP
NFE_CEP=18000000
NFE_IBGE_MUNICIPIO=3552205
NFE_SERIE=1
```

Para gerar o base64 do certificado:
```bash
base64 -w 0 cert.pfx
# ou no PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pfx"))
```

---

## Task 1: Instalar dependências no servidor

**Files:**
- Modify: `server/package.json`

**Step 1: Instalar pacotes**

```bash
cd server
npm install node-forge xml-crypto axios fast-xml-parser
npm install --save-dev @types/node-forge
```

**Step 2: Verificar que instalaram**

```bash
ls node_modules | grep -E "node-forge|xml-crypto|axios|fast-xml-parser"
```

Expected: as 4 pastas aparecem.

**Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "deps: add node-forge, xml-crypto, axios, fast-xml-parser for NF-e self-hosted"
```

---

## Task 2: Criar `server/services/cert.ts`

Responsável por carregar o certificado A1 e assinar XML.

**Files:**
- Create: `server/services/cert.ts`

**Step 1: Criar o arquivo**

```typescript
import * as forge from 'node-forge';

export interface CertData {
  keyPem: string;
  certPem: string;
  certDer: string; // base64 DER — usado no XML de assinatura
}

let _cached: CertData | null = null;

export function loadCert(): CertData {
  if (_cached) return _cached;

  const base64 = process.env.NFE_CERT_BASE64;
  const password = process.env.NFE_CERT_PASSWORD ?? '';

  if (!base64) throw new Error('NFE_CERT_BASE64 não configurado.');

  const pfxDer = Buffer.from(base64, 'base64');
  const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxDer));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

  let keyObj: forge.pki.rsa.PrivateKey | null = null;
  let certObj: forge.pki.Certificate | null = null;

  for (const safeContents of pfx.safeContents) {
    for (const safeBag of safeContents.safeBags) {
      if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag && safeBag.key) {
        keyObj = safeBag.key as forge.pki.rsa.PrivateKey;
      }
      if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
        certObj = safeBag.cert;
      }
    }
  }

  if (!keyObj || !certObj) throw new Error('Certificado ou chave privada não encontrados no .pfx.');

  const keyPem = forge.pki.privateKeyToPem(keyObj);
  const certPem = forge.pki.certificateToPem(certObj);
  const certDer = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes(), 'binary').toString('base64');

  _cached = { keyPem, certPem, certDer };
  return _cached;
}

/** Retorna os dados do certificado e valida se ainda está válido. */
export function checkCertValidity(): { valid: boolean; expiresAt: Date; daysLeft: number } {
  const cert = loadCert();
  const parsed = forge.pki.certificateFromPem(cert.certPem);
  const expiresAt = parsed.validity.notAfter;
  const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / 86400000);
  return { valid: daysLeft > 0, expiresAt, daysLeft };
}
```

**Step 2: Verificar compilação TypeScript**

```bash
cd server
npx tsc --noEmit
```

Expected: sem erros no novo arquivo.

**Step 3: Commit**

```bash
git add server/services/cert.ts
git commit -m "feat: add cert.ts — load A1 certificate from env var"
```

---

## Task 3: Criar `server/services/nfe-sefaz.ts`

Emissão de NF-e diretamente no SEFAZ-SP.

**Files:**
- Create: `server/services/nfe-sefaz.ts`

**Step 1: Criar o arquivo**

```typescript
import axios from 'axios';
import * as crypto from 'crypto';
import { SignedXml } from 'xml-crypto';
import { XMLParser } from 'fast-xml-parser';
import { loadCert } from './cert';

const SEFAZ_URLS = {
  producao:    'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
  homologacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
};

const SEFAZ_STATUS_URLS = {
  producao:    'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
  homologacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
};

function getAmbiente(): 'producao' | 'homologacao' {
  return (process.env.NFE_AMBIENTE ?? 'homologacao') === 'producao' ? 'producao' : 'homologacao';
}

function tpAmb(): '1' | '2' {
  return getAmbiente() === 'producao' ? '1' : '2';
}

/** Gera código aleatório de 8 dígitos para cNF */
function randomCNF(): string {
  return String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
}

/** Calcula dígito verificador da chave de acesso NF-e (mod 11) */
function calcDV(chave43: string): string {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;
  for (let i = 0; i < 43; i++) {
    sum += Number(chave43[42 - i]) * weights[i % 8];
  }
  const rem = sum % 11;
  return rem < 2 ? '0' : String(11 - rem);
}

/** Monta chave de acesso de 44 dígitos */
function buildChaveAcesso(nNF: number, cNF: string): string {
  const cUF = process.env.NFE_IBGE_MUNICIPIO?.substring(0, 2) ?? '35'; // SP = 35
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

/** Constrói o XML infNFe sem assinatura */
function buildInfNFe(inv: any, nNF: number, chave: string): string {
  const dhEmi = new Date().toISOString().replace('Z', '-03:00').substring(0, 22) + ':00';
  const cnpjEmit = (process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
  const docDest = (inv.clientDocument ?? '').replace(/\D/g, '');
  const tagDoc = docDest.length === 11 ? `<CPF>${docDest}</CPF>` : `<CNPJ>${docDest}</CNPJ>`;

  const itemsXml = (inv.items ?? []).map((it: any, i: number) => {
    const vProd = ((it.quantity ?? 1) * (it.unitPrice ?? 0)).toFixed(2);
    return `<det nItem="${i + 1}">
      <prod>
        <cProd>${String(i + 1).padStart(6, '0')}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${it.description ?? ''}</xProd>
        <NCM>${it.ncm ?? ''}</NCM>
        <CFOP>${it.cfop ?? ''}</CFOP>
        <uCom>${it.unit ?? 'UN'}</uCom>
        <qCom>${(it.quantity ?? 1).toFixed(4)}</qCom>
        <vUnCom>${(it.unitPrice ?? 0).toFixed(10)}</vUnCom>
        <vProd>${vProd}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>${it.unit ?? 'UN'}</uTrib>
        <qTrib>${(it.quantity ?? 1).toFixed(4)}</qTrib>
        <vUnTrib>${(it.unitPrice ?? 0).toFixed(10)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS><ICMSSN400><orig>0</orig><CSOSN>400</CSOSN></ICMSSN400></ICMS>
        <PIS><PISAliq><CST>07</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>
        <COFINS><COFINSAliq><CST>07</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>
      </imposto>
    </det>`;
  }).join('\n');

  const vNF = (inv.totalValue ?? 0).toFixed(2);
  const vProd = (inv.subtotal ?? 0).toFixed(2);

  return `<infNFe xmlns="http://www.portalfiscal.inf.br/nfe" Id="NFe${chave}" versao="4.00">
    <ide>
      <cUF>${chave.substring(0, 2)}</cUF>
      <cNF>${chave.substring(35, 43)}</cNF>
      <natOp>Venda de produto</natOp>
      <mod>55</mod>
      <serie>${process.env.NFE_SERIE ?? '1'}</serie>
      <nNF>${nNF}</nNF>
      <dhEmi>${dhEmi}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${process.env.NFE_IBGE_MUNICIPIO ?? '3552205'}</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${chave[43]}</cDV>
      <tpAmb>${tpAmb()}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>${cnpjEmit}</CNPJ>
      <xNome>${process.env.NFE_RAZAO_SOCIAL ?? ''}</xNome>
      <enderEmit>
        <xLgr>${process.env.NFE_LOGRADOURO ?? ''}</xLgr>
        <nro>${process.env.NFE_NUMERO ?? ''}</nro>
        <xBairro>${process.env.NFE_BAIRRO ?? ''}</xBairro>
        <cMun>${process.env.NFE_IBGE_MUNICIPIO ?? '3552205'}</cMun>
        <xMun>${process.env.NFE_MUNICIPIO ?? 'Sorocaba'}</xMun>
        <UF>${process.env.NFE_UF ?? 'SP'}</UF>
        <CEP>${(process.env.NFE_CEP ?? '').replace(/\D/g, '')}</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
        <fone></fone>
      </enderEmit>
      <CRT>1</CRT>
    </emit>
    <dest>
      ${tagDoc}
      <xNome>${inv.clientName ?? ''}</xNome>
      <enderDest>
        <xLgr>${inv.clientAddress ?? ''}</xLgr>
        <nro>${inv.clientNumber ?? ''}</nro>
        <xBairro>${inv.clientDistrict ?? ''}</xBairro>
        <cMun>${IBGE_MAP[normalizeCity(inv.clientCity)] ?? '9999999'}</cMun>
        <xMun>${inv.clientCity ?? ''}</xMun>
        <UF>${inv.clientState ?? ''}</UF>
        <CEP>${(inv.clientPostalCode ?? '').replace(/\D/g, '')}</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
      </enderDest>
      <indIEDest>9</indIEDest>
      <email>${inv.clientEmail ?? ''}</email>
    </dest>
    ${itemsXml}
    <total>
      <ICMSTot>
        <vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST>
        <vProd>${vProd}</vProd>
        <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII>
        <vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro>
        <vNF>${vNF}</vNF>
      </ICMSTot>
    </total>
    <transp><modFrete>9</modFrete></transp>
    <infAdic><infCpl>${inv.notes ?? ''}</infCpl></infAdic>
  </infNFe>`;
}

const IBGE_MAP: Record<string, string> = {
  'sorocaba': '3552205', 'sao paulo': '3550308', 'campinas': '3509502',
  'santos': '3548100', 'ribeirao preto': '3543402', 'guarulhos': '3518800',
  'jundiai': '3525904', 'piracicaba': '3538709', 'bauru': '3506003',
};

function normalizeCity(city: string): string {
  return city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Assina o XML NF-e — assinatura envelopada no elemento infNFe */
function signNFe(infNFeXml: string): string {
  const { keyPem, certPem, certDer } = loadCert();

  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">${infNFeXml}</NFe>`;

  const sig = new SignedXml();
  sig.privateKey = keyPem;
  sig.publicCert = certPem;
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

  // Extrai o Id da chave (NFe44digits)
  const idMatch = infNFeXml.match(/Id="(NFe\d{44})"/);
  if (!idMatch) throw new Error('Id não encontrado no infNFe.');
  const refId = idMatch[1];

  sig.addReference(`//*[@Id='${refId}']`, [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  ], 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');

  sig.computeSignature(nfe);
  const signed = sig.getSignedXml();

  // Injeta X509Certificate no KeyInfo
  return signed.replace(
    '<X509Data/>',
    `<X509Data><X509Certificate>${certDer}</X509Certificate></X509Data>`,
  );
}

/** Monta envelope SOAP para NFeAutorizacao4 */
function buildSoapEnvelope(nfeXml: string, lote: number): string {
  const envXml = `<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
    <idLote>${lote}</idLote>
    <indSinc>1</indSinc>
    ${nfeXml}
  </enviNFe>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
  <soapenv:Header/>
  <soapenv:Body>
    <nfe:nfeDadosMsg>${envXml}</nfe:nfeDadosMsg>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export interface NFeResult {
  chaveAcesso: string;
  protocolo: string;
  numeroNF: number;
  xmlAutorizado: string;
  status: 'autorizado' | 'rejeitado' | 'erro';
  motivo: string;
}

/** Emite NF-e no SEFAZ — processo síncrono (indSinc=1) */
export async function emitirNFe(inv: any, nNF: number): Promise<NFeResult> {
  const cNF = randomCNF();
  const chave = buildChaveAcesso(nNF, cNF);
  const infNFeXml = buildInfNFe(inv, nNF, chave);
  const nfeAssinada = signNFe(infNFeXml);
  const soapBody = buildSoapEnvelope(nfeAssinada, Date.now());

  const url = SEFAZ_URLS[getAmbiente()];
  const { keyPem, certPem } = loadCert();

  const response = await axios.post(url, soapBody, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote',
    },
    httpsAgent: new (require('https').Agent)({
      key: keyPem,
      cert: certPem,
      rejectUnauthorized: false, // SEFAZ usa certificado próprio
    }),
    timeout: 30000,
  });

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(response.data);

  // Navega na resposta SOAP até retConsReciNFe/protNFe
  const body = parsed?.['soapenv:Envelope']?.['soapenv:Body'] ?? parsed?.Envelope?.Body ?? {};
  const nfeResult = body?.['nfeResultMsg'] ?? body?.nfeResultMsg ?? {};
  const retEnv = nfeResult?.retEnviNFe ?? nfeResult;
  const infRec = retEnv?.infRec;
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

  if (cStat.startsWith('2') || cStat.startsWith('3') || cStat.startsWith('4') || cStat.startsWith('5') || cStat.startsWith('6')) {
    return { chaveAcesso: chave, protocolo: '', numeroNF: nNF, xmlAutorizado: '', status: 'rejeitado', motivo: `${cStat} - ${xMotivo}` };
  }

  throw new Error(`SEFAZ retornou cStat=${cStat}: ${xMotivo}`);
}
```

**Step 2: Verificar compilação**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

**Step 3: Commit**

```bash
git add server/services/nfe-sefaz.ts
git commit -m "feat: add nfe-sefaz.ts — direct NF-e emission to SEFAZ-SP"
```

---

## Task 4: Criar `server/services/nfse-dsf.ts`

Emissão de NFS-e via protocolo DSF para Sorocaba e Campinas.

**Files:**
- Create: `server/services/nfse-dsf.ts`

**Step 1: Criar o arquivo**

```typescript
import axios from 'axios';
import { SignedXml } from 'xml-crypto';
import { XMLParser } from 'fast-xml-parser';
import { loadCert } from './cert';

// Endpoints DSF por cidade (IBGE code → URL)
const DSF_URLS: Record<string, string> = {
  '3552205': 'http://www.issdigitalsod.com.br/WsNFe2/LoteRps.jws', // Sorocaba
  '3509502': 'http://issdigital.campinas.sp.gov.br/WsNFe2/LoteRps.jws', // Campinas
};

const DSF_NAMESPACES: Record<string, string> = {
  '3552205': 'http://www.issdigitalsod.com.br/',
  '3509502': 'http://www.campinas.sp.gov.br/',
};

const IBGE_MAP: Record<string, string> = {
  'sorocaba': '3552205', 'campinas': '3509502',
};

function normalizeCity(city: string): string {
  return city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function getIBGE(city: string): string {
  return IBGE_MAP[normalizeCity(city)] ?? process.env.NFE_IBGE_MUNICIPIO ?? '3552205';
}

/** Monta o XML do RPS (Recibo Provisório de Serviços) para DSF */
function buildRpsXml(inv: any, numeroRps: number): string {
  const cnpj = (process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
  const im = process.env.NFE_INSCRICAO_MUNICIPAL ?? '';
  const docTomador = (inv.clientDocument ?? '').replace(/\D/g, '');
  const tagDoc = docTomador.length === 11 ? `<CPF>${docTomador}</CPF>` : `<CNPJ>${docTomador}</CNPJ>`;
  const ibge = getIBGE(inv.clientCity ?? '');
  const desc = (inv.items ?? []).map((i: any) => i.description).filter(Boolean).join('; ') || inv.notes || 'Serviços prestados';
  const dhEmi = new Date().toISOString().replace(/\..+/, '');
  const vServicos = (inv.totalValue ?? 0).toFixed(2);
  const aliqISS = ((inv.taxRate ?? 0) / 100).toFixed(4);
  const vISS = (inv.taxAmount ?? 0).toFixed(2);

  return `<Rps>
    <InfDeclaracaoPrestacaoServico Id="Rps${numeroRps}">
      <Rps>
        <IdentificacaoRps>
          <Numero>${numeroRps}</Numero>
          <Serie>${process.env.NFE_SERIE ?? '1'}</Serie>
          <Tipo>1</Tipo>
        </IdentificacaoRps>
        <DataEmissao>${dhEmi}</DataEmissao>
        <Status>1</Status>
      </Rps>
      <Competencia>${dhEmi}</Competencia>
      <Servico>
        <Valores>
          <ValorServicos>${vServicos}</ValorServicos>
          <ValorDeducoes>0.00</ValorDeducoes>
          <ValorPis>0.00</ValorPis>
          <ValorCofins>0.00</ValorCofins>
          <ValorInss>0.00</ValorInss>
          <ValorIr>0.00</ValorIr>
          <ValorCsll>0.00</ValorCsll>
          <IssRetido>2</IssRetido>
          <ValorIss>${vISS}</ValorIss>
          <ValorIssRetido>0.00</ValorIssRetido>
          <OutrasRetencoes>0.00</OutrasRetencoes>
          <BaseCalculo>${vServicos}</BaseCalculo>
          <Aliquota>${aliqISS}</Aliquota>
          <ValorLiquidoNfse>${vServicos}</ValorLiquidoNfse>
          <DescontoIncondicionado>0.00</DescontoIncondicionado>
          <DescontoCondicionado>0.00</DescontoCondicionado>
        </Valores>
        <ItemListaServico>${inv.serviceCode ?? '14.01'}</ItemListaServico>
        <CodigoCnae>5620101</CodigoCnae>
        <CodigoTributacaoMunicipio>${inv.serviceCode ?? '14.01'}</CodigoTributacaoMunicipio>
        <Discriminacao>${desc}</Discriminacao>
        <CodigoMunicipio>${ibge}</CodigoMunicipio>
        <ExigibilidadeISS>1</ExigibilidadeISS>
        <MunicipioIncidencia>${ibge}</MunicipioIncidencia>
      </Servico>
      <Prestador>
        <CpfCnpj><CNPJ>${cnpj}</CNPJ></CpfCnpj>
        <InscricaoMunicipal>${im}</InscricaoMunicipal>
      </Prestador>
      <Tomador>
        <IdentificacaoTomador>
          <CpfCnpj>${tagDoc}</CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${inv.clientName ?? ''}</RazaoSocial>
        <Endereco>
          <Logradouro>${inv.clientAddress ?? ''}</Logradouro>
          <Numero>${inv.clientNumber ?? ''}</Numero>
          <Bairro>${inv.clientDistrict ?? ''}</Bairro>
          <CodigoMunicipio>${ibge}</CodigoMunicipio>
          <Uf>${inv.clientState ?? 'SP'}</Uf>
          <Cep>${(inv.clientPostalCode ?? '').replace(/\D/g, '')}</Cep>
        </Endereco>
        <Contato>
          <Email>${inv.clientEmail ?? ''}</Email>
        </Contato>
      </Tomador>
      <OptanteSimplesNacional>1</OptanteSimplesNacional>
      <IncentivoFiscal>2</IncentivoFiscal>
    </InfDeclaracaoPrestacaoServico>
  </Rps>`;
}

/** Assina o XML do RPS */
function signRps(rpsXml: string, numeroRps: number): string {
  const { keyPem, certPem, certDer } = loadCert();
  const sig = new SignedXml();
  sig.privateKey = keyPem;
  sig.publicCert = certPem;
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

  sig.addReference(`//*[@Id='Rps${numeroRps}']`, [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  ], 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');

  sig.computeSignature(rpsXml);
  const signed = sig.getSignedXml();
  return signed.replace('<X509Data/>', `<X509Data><X509Certificate>${certDer}</X509Certificate></X509Data>`);
}

/** Monta lote ABRASF/DSF com 1 RPS e envia */
function buildLoteXml(rpsAssinado: string, numeroLote: number): string {
  const cnpj = (process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
  const im = process.env.NFE_INSCRICAO_MUNICIPAL ?? '';

  return `<EnviarLoteRpsSincronoEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps Id="Lote${numeroLote}" versao="2.01">
      <NumeroLote>${numeroLote}</NumeroLote>
      <CpfCnpj><CNPJ>${cnpj}</CNPJ></CpfCnpj>
      <InscricaoMunicipal>${im}</InscricaoMunicipal>
      <QuantidadeRps>1</QuantidadeRps>
      <ListaRps>${rpsAssinado}</ListaRps>
    </LoteRps>
  </EnviarLoteRpsSincronoEnvio>`;
}

function buildSoapEnvelope(loteXml: string, namespace: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="${namespace}">
  <soapenv:Header/>
  <soapenv:Body>
    <nfse:RecepcionarLoteRpsSincrono>
      <nfse:xmlEnvio><![CDATA[${loteXml}]]></nfse:RecepcionarLoteRpsSincrono>
    </nfse:RecepcionarLoteRpsSincrono>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export interface NFSeResult {
  numeroNFSe: string;
  codigoVerificacao: string;
  xmlResposta: string;
  status: 'emitida' | 'erro';
  motivo: string;
}

export async function emitirNFSe(inv: any, numeroRps: number): Promise<NFSeResult> {
  const ibge = getIBGE(inv.clientCity ?? '');
  const url = DSF_URLS[ibge];
  const ns = DSF_NAMESPACES[ibge];

  if (!url) throw new Error(`Município não suportado para NFS-e DSF: ${inv.clientCity} (IBGE ${ibge}). Cidades suportadas: Sorocaba, Campinas.`);

  const rpsXml = buildRpsXml(inv, numeroRps);
  const rpsAssinado = signRps(rpsXml, numeroRps);
  const loteXml = buildLoteXml(rpsAssinado, Date.now());
  const soapBody = buildSoapEnvelope(loteXml, ns);

  const response = await axios.post(url, soapBody, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '' },
    timeout: 30000,
  });

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(response.data);

  const body = parsed?.['soapenv:Envelope']?.['soapenv:Body'] ?? parsed?.Envelope?.Body ?? {};
  const result = body?.RecepcionarLoteRpsSincronoResponse?.return ?? body?.return ?? {};

  // Parseia XML retornado (vem como string no campo return)
  const xmlRetorno = typeof result === 'string' ? result : String(result);
  const parsedRetorno = parser.parse(xmlRetorno);
  const listaNfse = parsedRetorno?.EnviarLoteRpsSincronoResposta?.ListaNfse?.CompNfse?.Nfse?.InfNfse;
  const listaErros = parsedRetorno?.EnviarLoteRpsSincronoResposta?.ListaMensagemRetorno?.MensagemRetorno;

  if (listaErros) {
    const msg = Array.isArray(listaErros) ? listaErros[0] : listaErros;
    return { numeroNFSe: '', codigoVerificacao: '', xmlResposta: xmlRetorno, status: 'erro', motivo: `${msg?.Codigo ?? ''} - ${msg?.Mensagem ?? 'Erro desconhecido'}` };
  }

  if (listaNfse) {
    return {
      numeroNFSe: String(listaNfse?.Numero ?? ''),
      codigoVerificacao: String(listaNfse?.CodigoVerificacao ?? ''),
      xmlResposta: xmlRetorno,
      status: 'emitida',
      motivo: 'NFS-e emitida com sucesso',
    };
  }

  throw new Error('Resposta inesperada do webservice NFS-e DSF.');
}
```

**Step 2: Verificar compilação**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

**Step 3: Commit**

```bash
git add server/services/nfse-dsf.ts
git commit -m "feat: add nfse-dsf.ts — direct NFS-e emission via DSF SOAP (Sorocaba/Campinas)"
```

---

## Task 5: Criar `server/services/nfeCounter.ts`

Controla a numeração sequencial de NF-e e NFS-e.

**Files:**
- Create: `server/services/nfeCounter.ts`

**Step 1: Criar o arquivo**

```typescript
import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.NfeCounter || mongoose.model('NfeCounter', CounterSchema);

/** Incrementa e retorna o próximo número para 'nfe' ou 'nfse' */
export async function nextNumber(type: 'nfe' | 'nfse'): Promise<number> {
  const result = await Counter.findByIdAndUpdate(
    type,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return result.seq;
}
```

**Step 2: Verificar compilação**

```bash
cd server && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add server/services/nfeCounter.ts
git commit -m "feat: add nfeCounter.ts — sequential NF number per type"
```

---

## Task 6: Atualizar schema do invoice em `server/routes/invoices.ts`

Renomear campos `nfeio*` para campos genéricos.

**Files:**
- Modify: `server/routes/invoices.ts` (linhas 84–92)

**Step 1: Substituir bloco de campos nfe.io no schema Mongoose**

Localizar:
```typescript
  // Resposta nfe.io
  nfeioId: { type: String, default: null },
  nfeioStatus: { type: String, default: null },
  nfeioNumber: { type: String, default: null },
  nfeioPdfUrl: { type: String, default: null },
  nfeioXmlUrl: { type: String, default: null },
  nfeioAccessKey: { type: String, default: null },
  nfeioProtocol: { type: String, default: null },
  nfeioRawResponse: { type: Object, default: null },
```

Substituir por:
```typescript
  // Emissão fiscal — campos genéricos
  emissaoStatus: { type: String, default: null },  // 'processing' | 'emitida' | 'erro'
  numeroNF: { type: String, default: null },
  chaveAcesso: { type: String, default: null },
  protocolo: { type: String, default: null },
  xmlEmitido: { type: String, default: null },
  emissaoMotivo: { type: String, default: null },
```

**Step 2: Remover funções nfe.io (linhas 15–56)**

Remover inteiramente:
- Função `nfeioHeaders()`
- Função `nfeioBase()`
- Função `nfeioBaseNfe()`

Manter: `IBGE_CITIES`, `ibgeCity()` (ainda usados internamente se necessário).

**Step 3: Atualizar `generateInvoiceHtml` — substituir referências nfeio***

```typescript
// Linha ~143: trocar
<div class="sub">Emitida via nfe.io • Protocolo ${inv.nfeioProtocol ?? '—'}</div>
<div class="badge">✓ EMITIDA — NF ${inv.nfeioNumber ?? '—'}</div>
// Por:
<div class="sub">Protocolo ${inv.protocolo ?? '—'}</div>
<div class="badge">✓ EMITIDA — NF ${inv.numeroNF ?? '—'}</div>

// Linha ~159: trocar
<div class="row"><span>Número</span><span>${inv.nfeioNumber ?? '—'}</span></div>
// Por:
<div class="row"><span>Número</span><span>${inv.numeroNF ?? '—'}</span></div>

// Linha ~182: trocar
${isNfe && inv.nfeioAccessKey ? `<div class="chave">Chave de Acesso NF-e: ${inv.nfeioAccessKey}</div>` : ''}
// Por:
${isNfe && inv.chaveAcesso ? `<div class="chave">Chave de Acesso NF-e: ${inv.chaveAcesso}</div>` : ''}

// Linha ~186: trocar
Documento gerado pelo sistema Soul540 • nfeioId: ${inv.nfeioId ?? '—'}
// Por:
Documento gerado pelo sistema Soul540

// Linha ~225 (XML NF-e): trocar
<nNF>${inv.nfeioNumber ?? '1'}</nNF>
// Por:
<nNF>${inv.numeroNF ?? '1'}</nNF>

// E os outros dois usos de nfeioNumber/nfeioAccessKey/nfeioProtocol no generateInvoiceXml
```

**Step 4: Atualizar download XML filename (linha ~339)**

```typescript
// Trocar:
const filename = `NF${inv.nfeioNumber ?? inv._id}-${inv.type?.toUpperCase() ?? 'NF'}.xml`;
// Por:
const filename = `NF${inv.numeroNF ?? inv._id}-${inv.type?.toUpperCase() ?? 'NF'}.xml`;
```

**Step 5: Verificar compilação**

```bash
cd server && npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add server/routes/invoices.ts
git commit -m "refactor: rename nfeio* schema fields to generic emissao* fields"
```

---

## Task 7: Substituir rota `POST /:id/emit` em `server/routes/invoices.ts`

**Files:**
- Modify: `server/routes/invoices.ts` (linhas 368–513)

**Step 1: Adicionar imports no topo do arquivo**

```typescript
import { emitirNFe } from '../services/nfe-sefaz';
import { emitirNFSe } from '../services/nfse-dsf';
import { nextNumber } from '../services/nfeCounter';
import { loadCert, checkCertValidity } from '../services/cert';
```

**Step 2: Substituir a rota `POST /:id/emit` inteira**

Substituir do `router.post('/:id/emit', ...` até o `});` (linhas 368–513) por:

```typescript
router.post('/:id/emit', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).json({ error: 'Not found' });

  // Validações gerais
  if (!inv.clientDocument?.replace(/\D/g, '')) {
    return res.status(400).json({ error: 'CPF/CNPJ do cliente é obrigatório para emissão.' });
  }
  if (!inv.clientAddress || !inv.clientCity || !inv.clientPostalCode) {
    return res.status(400).json({ error: 'Endereço completo do cliente é obrigatório.' });
  }

  if (inv.type === 'nfe') {
    const items = inv.items ?? [];
    if (items.length === 0) return res.status(400).json({ error: 'NF-e requer pelo menos um item.' });
    const sem = items.find((i: any) => !i.ncm || !i.cfop);
    if (sem) return res.status(400).json({ error: `Item "${sem.description || 'sem descrição'}" está sem NCM ou CFOP.` });
  }

  // Verificar certificado
  try {
    const certInfo = checkCertValidity();
    if (!certInfo.valid) return res.status(503).json({ error: 'Certificado digital expirado. Renove o certificado A1.' });
    if (certInfo.daysLeft < 30) console.warn(`[nfe] Certificado expira em ${certInfo.daysLeft} dias.`);
  } catch (err) {
    return res.status(503).json({ error: `Erro ao carregar certificado: ${String(err)}` });
  }

  // Marcar como processando
  await model.findByIdAndUpdate(req.params.id, { emissaoStatus: 'processing' });

  try {
    if (inv.type === 'nfe') {
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

    } else {
      const nRps = await nextNumber('nfse');
      const result = await emitirNFSe(inv, nRps);

      if (result.status === 'erro') {
        const updated = await model.findByIdAndUpdate(req.params.id,
          { emissaoStatus: 'erro', emissaoMotivo: result.motivo }, { new: true });
        return res.status(422).json({ error: result.motivo, invoice: updated });
      }

      const updated = await model.findByIdAndUpdate(req.params.id, {
        emissaoStatus: 'emitida',
        status: 'emitida',
        numeroNF: result.numeroNFSe,
        protocolo: result.codigoVerificacao,
        xmlEmitido: result.xmlResposta,
        emissaoMotivo: result.motivo,
      }, { new: true });

      await logAudit({ req, action: 'update', resource: 'invoices', resourceId: req.params.id, description: `Emitiu NFS-e diretamente na prefeitura: ${inv.clientName} (NFS-e nº ${result.numeroNFSe})` });
      return res.json(updated);
    }

  } catch (err) {
    await model.findByIdAndUpdate(req.params.id, { emissaoStatus: 'erro', emissaoMotivo: String(err) });
    return res.status(502).json({ error: `Falha na comunicação fiscal: ${String(err)}` });
  }
});
```

**Step 3: Substituir rota `GET /:id/nfeio-status` por `GET /:id/status`**

Remover inteiramente a rota `router.get('/:id/nfeio-status', ...)` (linhas 515–569) e substituir por:

```typescript
router.get('/:id/status', async (req, res) => {
  const model = models.getModel(req);
  const inv = await model.findById(req.params.id) as any;
  if (!inv) return res.status(404).json({ error: 'Not found' });
  // Status já está no documento — retorna diretamente
  res.json(inv);
});
```

**Step 4: Verificar compilação**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

**Step 5: Commit**

```bash
git add server/routes/invoices.ts
git commit -m "feat: replace nfe.io emit route with direct SEFAZ/DSF emission"
```

---

## Task 8: Atualizar `shared/types.ts`

**Files:**
- Modify: `shared/types.ts` (linhas 87–136)

**Step 1: Substituir campos nfeio* na interface Invoice**

Localizar e remover:
```typescript
  nfeioId?: string;
  nfeioStatus?: 'processing' | 'issued' | 'error';
  nfeioNumber?: string;
  nfeioPdfUrl?: string;
  nfeioXmlUrl?: string;
  nfeioAccessKey?: string;
  nfeioProtocol?: string;
  nfeioRawResponse?: Record<string, unknown>;
```

Substituir por:
```typescript
  emissaoStatus?: 'processing' | 'emitida' | 'erro';
  numeroNF?: string;
  chaveAcesso?: string;
  protocolo?: string;
  xmlEmitido?: string;
  emissaoMotivo?: string;
```

**Step 2: Verificar compilação do projeto**

```bash
cd server && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add shared/types.ts
git commit -m "refactor: update Invoice type — replace nfeio* with generic emissao* fields"
```

---

## Task 9: Criar script de migração MongoDB

**Files:**
- Create: `server/scripts/migrate-invoice-fields.ts`

**Step 1: Criar o script**

```typescript
/**
 * Migração: renomeia campos nfeio* para campos genéricos em todas as coleções de notas fiscais.
 * Executar UMA VEZ: npx ts-node server/scripts/migrate-invoice-fields.ts
 */
import mongoose from 'mongoose';

const COLLECTIONS = ['invoices', 'franchiseinvoices', 'factoryinvoices'];

const RENAME_MAP: Record<string, string> = {
  nfeioStatus:      'emissaoStatus',
  nfeioNumber:      'numeroNF',
  nfeioAccessKey:   'chaveAcesso',
  nfeioProtocol:    'protocolo',
};

const REMOVE_FIELDS = ['nfeioId', 'nfeioPdfUrl', 'nfeioXmlUrl', 'nfeioRawResponse'];

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/soul540');
  console.log('Conectado ao MongoDB.');

  for (const colName of COLLECTIONS) {
    const col = mongoose.connection.collection(colName);
    const count = await col.countDocuments({});
    console.log(`\n[${colName}] ${count} documentos`);

    // Renomear campos
    const renameOp: Record<string, string> = {};
    for (const [from, to] of Object.entries(RENAME_MAP)) {
      renameOp[from] = to;
    }
    const renameResult = await col.updateMany(
      { $or: Object.keys(RENAME_MAP).map(k => ({ [k]: { $exists: true } })) },
      { $rename: renameOp },
    );
    console.log(`  Renomeados: ${renameResult.modifiedCount} docs`);

    // Mapear valores de status: 'issued' → 'emitida', 'error' → 'erro'
    await col.updateMany({ emissaoStatus: 'issued' }, { $set: { emissaoStatus: 'emitida' } });
    await col.updateMany({ emissaoStatus: 'error' },  { $set: { emissaoStatus: 'erro' } });
    console.log(`  Status mapeados.`);

    // Remover campos obsoletos
    const unsetOp: Record<string, ''> = {};
    REMOVE_FIELDS.forEach(f => { unsetOp[f] = ''; });
    const removeResult = await col.updateMany({}, { $unset: unsetOp });
    console.log(`  Campos removidos: ${removeResult.modifiedCount} docs`);
  }

  await mongoose.disconnect();
  console.log('\nMigração concluída.');
}

migrate().catch(e => { console.error(e); process.exit(1); });
```

**Step 2: Executar a migração (APENAS UMA VEZ em produção)**

```bash
cd server
MONGO_URI="mongodb://..." npx ts-node scripts/migrate-invoice-fields.ts
```

Expected output:
```
Conectado ao MongoDB.
[invoices] X documentos
  Renomeados: X docs
  Status mapeados.
  Campos removidos: X docs
...
Migração concluída.
```

**Step 3: Commit**

```bash
git add server/scripts/migrate-invoice-fields.ts
git commit -m "chore: add MongoDB migration script for nfeio* → emissao* field rename"
```

---

## Task 10: Atualizar `src/frontend/pages/NotasFiscais/NotasFiscais.tsx`

**Files:**
- Modify: `src/frontend/pages/NotasFiscais/NotasFiscais.tsx`

**Step 1: Substituir chamada de polling de status**

Localizar todas as ocorrências de:
```typescript
pollInvoiceStatus   // ou fetch('/api/invoices/:id/nfeio-status')
```
Substituir por chamada à nova rota `/status`.

Em `AppContext.tsx` (linha da função `pollInvoiceStatus`):
```typescript
// Trocar:
const res = await apiFetch(`/api/invoices/${id}/nfeio-status`);
// Por:
const res = await apiFetch(`/api/invoices/${id}/status`);
```

**Step 2: Substituir referências nfeio* no componente**

Buscar e substituir todas as ocorrências no arquivo:

| Buscar | Substituir |
|--------|-----------|
| `inv.nfeioStatus` | `inv.emissaoStatus` |
| `inv.nfeioNumber` | `inv.numeroNF` |
| `inv.nfeioAccessKey` | `inv.chaveAcesso` |
| `inv.nfeioProtocol` | `inv.protocolo` |
| `inv.nfeioPdfUrl` | — (remover ou usar download/pdf) |
| `inv.nfeioXmlUrl` | — (remover ou usar download/xml) |
| `nfeioStatus === 'issued'` | `emissaoStatus === 'emitida'` |
| `nfeioStatus === 'processing'` | `emissaoStatus === 'processing'` |
| `nfeioStatus === 'error'` | `emissaoStatus === 'erro'` |
| `'via nfe.io'` | `''` (remover texto) |
| `'Emitir via nfe.io'` | `'Emitir Nota Fiscal'` |
| `'Emitida via nfe.io'` | `'Nota Emitida'` |
| `'Erro nfe.io'` | `'Erro na Emissão'` |

**Step 3: Verificar TypeScript no frontend**

```bash
cd src
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/frontend/pages/NotasFiscais/NotasFiscais.tsx
git add src/frontend/contexts/AppContext.tsx
git commit -m "feat: update NotasFiscais UI — remove nfe.io references, use new field names"
```

---

## Task 11: Atualizar `.env.example` e configurar Coolify

**Files:**
- Modify: `.env.example`

**Step 1: Atualizar `.env.example`**

Remover:
```env
NFEIO_API_KEY=sua-chave-api-nfeio
NFEIO_COMPANY_ID_NFSE=id-da-empresa-nfse-na-nfeio
NFEIO_COMPANY_ID_NFE=id-da-empresa-nfe-na-nfeio
```

Adicionar:
```env
# Emissão fiscal self-hosted — certificado A1
NFE_CERT_BASE64=base64-do-arquivo-pfx
NFE_CERT_PASSWORD=senha-do-certificado
NFE_AMBIENTE=homologacao

# Dados da empresa emissora
NFE_CNPJ=00000000000000
NFE_RAZAO_SOCIAL=Soul 540 Pizzas e Eventos LTDA
NFE_INSCRICAO_MUNICIPAL=000000
NFE_LOGRADOURO=Rua Exemplo
NFE_NUMERO=100
NFE_BAIRRO=Centro
NFE_MUNICIPIO=Sorocaba
NFE_UF=SP
NFE_CEP=18000000
NFE_IBGE_MUNICIPIO=3552205
NFE_SERIE=1
```

**Step 2: Adicionar as variáveis no container Node.js no Coolify**

No painel Coolify > container do servidor Node.js > Environment Variables, adicionar todas as vars `NFE_*` acima com os valores reais.

**Step 3: Verificar startup do servidor**

Após deploy, checar logs do container. O servidor deve iniciar sem erros.

Teste rápido de saúde do certificado (via endpoint existente ou log):
```bash
# No container:
node -e "require('./dist/services/cert').checkCertValidity()" 
# Expected: { valid: true, expiresAt: ..., daysLeft: NNN }
```

**Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: update .env.example — replace NFEIO_* with NFE_* vars"
```

---

## Checklist de testes antes de ir para produção

1. **Ambiente homologação NF-e (SEFAZ):**
   - Setar `NFE_AMBIENTE=homologacao`
   - Criar nota de teste com NCM/CFOP válidos
   - Clicar Emitir — verificar se `emissaoStatus` vira `emitida` no banco
   - Verificar `chaveAcesso` tem 44 dígitos

2. **NFS-e (sem homologação — testar em produção):**
   - Criar nota de serviço com valor mínimo (R$ 0,01)
   - Emitir — verificar `numeroNF` retornado pela prefeitura
   - Confirmar nota no portal da prefeitura (Sorocaba: issdigitalsod.com.br)

3. **Setar `NFE_AMBIENTE=producao` após validar**

4. **Download PDF e XML** continuam funcionando (geram localmente, sem chamada externa)
