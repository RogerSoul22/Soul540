import 'dotenv/config';
import axios from 'axios';
import { SignedXml } from 'xml-crypto';
import { loadCert } from './server/services/cert';

function randomCNF() { return String(Math.floor(Math.random() * 99999999)).padStart(8, '0'); }
function calcDV(c43: string) {
  const w = [2,3,4,5,6,7,8,9]; let s = 0;
  for (let i=0;i<43;i++) s += Number(c43[42-i])*w[i%8];
  const r = s%11; return r<2?'0':String(11-r);
}
function buildChave(nNF: number, cNF: string) {
  const cUF = '35', cnpj = '37763790000177', mod = '55', serie = '001';
  const now = new Date();
  const AAMM = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}`;
  const nNFStr = String(nNF).padStart(9,'0');
  const c43 = `${cUF}${AAMM}${cnpj}${mod}${serie}${nNFStr}1${cNF}`;
  return c43 + calcDV(c43);
}

async function main() {
  const { keyPem, certPem, certDer } = loadCert();
  const cNF = randomCNF();
  const chave = buildChave(9999, cNF);
  
  const dhEmi = new Date().toISOString().replace('Z','-03:00').substring(0,22)+':00';
  
  const infNFe = `<infNFe xmlns="http://www.portalfiscal.inf.br/nfe" Id="NFe${chave}" versao="4.00">
    <ide><cUF>35</cUF><cNF>${cNF}</cNF><natOp>Venda</natOp><mod>55</mod><serie>1</serie>
    <nNF>9999</nNF><dhEmi>${dhEmi}</dhEmi><tpNF>1</tpNF><idDest>1</idDest>
    <cMunFG>3552205</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${chave[43]}</cDV>
    <tpAmb>2</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres>
    <procEmi>0</procEmi><verProc>1.0.0</verProc></ide>
    <emit><CNPJ>37763790000177</CNPJ><xNome>Soul Negocios Eventos e Consultoria Ltda</xNome>
    <enderEmit><xLgr>Alameda dos Lirios</xLgr><nro>515</nro><xBairro>Jardim Simus</xBairro>
    <cMun>3552205</cMun><xMun>Sorocaba</xMun><UF>SP</UF><CEP>18055141</CEP>
    <cPais>1058</cPais><xPais>Brasil</xPais><fone></fone></enderEmit><CRT>1</CRT></emit>
    <dest><CPF>11144477735</CPF>
    <xNome>NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL</xNome>
    <enderDest><xLgr>Rua Teste</xLgr><nro>1</nro><xBairro>Centro</xBairro>
    <cMun>3552205</cMun><xMun>Sorocaba</xMun><UF>SP</UF><CEP>18010000</CEP>
    <cPais>1058</cPais><xPais>Brasil</xPais></enderDest><indIEDest>9</indIEDest>
    <email>teste@teste.com</email></dest>
    <det nItem="1"><prod><cProd>000001</cProd><cEAN>SEM GTIN</cEAN><xProd>Consultoria teste</xProd>
    <NCM>49019900</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom>
    <vUnCom>1.0000000000</vUnCom><vProd>1.00</vProd><cEANTrib>SEM GTIN</cEANTrib>
    <uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>1.0000000000</vUnTrib><indTot>1</indTot></prod>
    <imposto><ICMS><ICMSSN400><orig>0</orig><CSOSN>400</CSOSN></ICMSSN400></ICMS>
    <PIS><PISAliq><CST>07</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>
    <COFINS><COFINSAliq><CST>07</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>
    </imposto></det>
    <total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST>
    <vProd>1.00</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
    <vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS>
    <vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>1.00</vNF></ICMSTot></total>
    <transp><modFrete>9</modFrete></transp>
    <pag><detPag><tPag>90</tPag><vPag>1.00</vPag></detPag></pag>
    <infAdic><infCpl>Homologacao</infCpl></infAdic>
  </infNFe>`;

  // Assinar
  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">${infNFe}</NFe>`;
  const sig = new SignedXml();
  (sig as any).privateKey = keyPem;
  (sig as any).publicCert = certPem;
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  sig.addReference({ xpath: `//*[@Id='NFe${chave}']`, transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature','http://www.w3.org/TR/2001/REC-xml-c14n-20010315'], digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256' } as any);
  sig.computeSignature(nfe);
  let signed = sig.getSignedXml().replace('<X509Data/>', `<X509Data><X509Certificate>${certDer}</X509Certificate></X509Data>`);

  const soap = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><soapenv:Header/><soapenv:Body><nfe:nfeDadosMsg><enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><idLote>${Date.now()}</idLote><indSinc>1</indSinc>${signed}</enviNFe></nfe:nfeDadosMsg></soapenv:Body></soapenv:Envelope>`;

  const https = require('https');
  try {
    const resp = await axios.post(
      'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      soap,
      { headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote' },
        httpsAgent: new https.Agent({ key: keyPem, cert: certPem, rejectUnauthorized: false }),
        timeout: 30000 }
    );
    console.log('HTTP Status:', resp.status);
    console.log('Resposta SEFAZ:\n', resp.data.substring(0, 2000));
  } catch (err: any) {
    console.log('Erro HTTP:', err.response?.status, err.response?.statusText);
    console.log('Corpo do erro:\n', err.response?.data?.substring(0, 2000));
    console.log('Mensagem:', err.message);
  }
}
main();
