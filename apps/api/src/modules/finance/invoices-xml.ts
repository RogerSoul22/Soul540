export function generateInvoiceXml(inv: any): string {
  const isNfe = inv.type === 'nfe';
  const now = new Date().toISOString();
  const documentNumber = (inv.clientDocument ?? '').replace(/\D/g, '');
  const documentTag = documentNumber.length === 11 ? 'Cpf' : 'Cnpj';

  if (isNfe) {
    const itemsXml = (inv.items ?? [])
      .map(
        (it: any, i: number) => `
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
        <COFINS><COFINSAliq><CST>07</CST><vBC>0.00</vBC>
          <pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS>
        </COFINSAliq></COFINS>
      </imposto>
    </det>`,
      )
      .join('');

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
  const desc =
    (inv.items ?? [])
      .map((i: any) => i.description)
      .filter(Boolean)
      .join('; ') ||
    inv.notes ||
    '';
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
              <CpfCnpj><${documentTag}>${documentNumber}</${documentTag}></CpfCnpj>
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
