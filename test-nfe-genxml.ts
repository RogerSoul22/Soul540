import 'dotenv/config';
import { loadCert } from './server/services/cert';
import { SignedXml } from 'xml-crypto';
import fs from 'fs';

function calcDV(c: string) {
  const w=[2,3,4,5,6,7,8,9]; let s=0;
  for(let i=0;i<43;i++) s+=Number(c[42-i])*w[i%8];
  const r=s%11; return r<2?'0':String(11-r);
}

function main() {
  const { keyPem, certPem, certDer } = loadCert();
  const cnpj = '37763790000177';
  const now = new Date();
  const AAMM = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}`;
  const cNF = '12345678';
  const nNF = 1;
  const c43 = `35${AAMM}${cnpj}550010${String(nNF).padStart(9,'0')}1${cNF}`;
  const chave = c43 + calcDV(c43);
  const dhEmi = new Date().toISOString().replace(/\.\d{3}Z/, '-03:00');

  const infNFe = `<infNFe xmlns="http://www.portalfiscal.inf.br/nfe" Id="NFe${chave}" versao="4.00"><ide><cUF>35</cUF><cNF>${cNF}</cNF><natOp>Venda de produto</natOp><mod>55</mod><serie>1</serie><nNF>${nNF}</nNF><dhEmi>${dhEmi}</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>3552205</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${chave[43]}</cDV><tpAmb>2</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>1.0.0</verProc></ide><emit><CNPJ>${cnpj}</CNPJ><xNome>Soul Negocios Eventos e Consultoria Ltda</xNome><enderEmit><xLgr>Alameda dos Lirios</xLgr><nro>515</nro><xBairro>Jardim Simus</xBairro><cMun>3552205</cMun><xMun>Sorocaba</xMun><UF>SP</UF><CEP>18055141</CEP><cPais>1058</cPais><xPais>Brasil</xPais></enderEmit><CRT>1</CRT></emit><dest><CPF>11144477735</CPF><xNome>NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL</xNome><enderDest><xLgr>Rua das Flores</xLgr><nro>100</nro><xBairro>Centro</xBairro><cMun>3552205</cMun><xMun>Sorocaba</xMun><UF>SP</UF><CEP>18010000</CEP><cPais>1058</cPais><xPais>Brasil</xPais></enderDest><indIEDest>9</indIEDest></dest><det nItem="1"><prod><cProd>000001</cProd><cEAN>SEM GTIN</cEAN><xProd>Consultoria teste</xProd><NCM>49019900</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom><vUnCom>1.0000000000</vUnCom><vProd>1.00</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>1.0000000000</vUnTrib><indTot>1</indTot></prod><imposto><ICMS><ICMSSN400><orig>0</orig><CSOSN>400</CSOSN></ICMSSN400></ICMS><PIS><PISNT><CST>07</CST></PISNT></PIS><COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS></imposto></det><total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST><vProd>1.00</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>1.00</vNF></ICMSTot></total><transp><modFrete>9</modFrete></transp><pag><detPag><tPag>90</tPag><vPag>1.00</vPag></detPag></pag></infNFe>`;

  const nfe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">${infNFe}</NFe>`;
  const sig = new SignedXml();
  (sig as any).privateKey = keyPem; (sig as any).publicCert = certPem;
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  sig.addReference({ xpath: `//*[@Id='NFe${chave}']`, transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature','http://www.w3.org/TR/2001/REC-xml-c14n-20010315'], digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256' } as any);
  sig.computeSignature(nfe);
  const signed = sig.getSignedXml().replace('<X509Data/>', `<X509Data><X509Certificate>${certDer}</X509Certificate></X509Data>`);

  // Salvar XML para validação
  fs.writeFileSync('/tmp/test_nfe.xml', signed);
  console.log('XML salvo em /tmp/test_nfe.xml');
  console.log('Chave:', chave, '(len:', chave.length, ')');
}
main();
