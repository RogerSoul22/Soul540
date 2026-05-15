# NF-e/NFS-e Self-Hosted em Node.js — Design

## Contexto

O sistema atualmente usa nfe.io como intermediário para emissão de NF-e e NFS-e. O objetivo é eliminar essa dependência por questões de custo (~10 notas/mês), implementando a comunicação direta com SEFAZ (NF-e) e prefeituras (NFS-e) dentro do próprio servidor Node.js.

---

## Arquitetura

```
Coolify VPS (Hostinger KVM4)
│
├── Node.js container (existente)
│   ├── NF-e  → assina XML + SOAP → SEFAZ-SP
│   └── NFS-e → assina XML + SOAP → DSF (Sorocaba / Campinas)
│
└── MongoDB container (existente)

Certificado A1: armazenado como base64 em env var no Coolify
```

Nenhum container novo. Nenhuma dependência de terceiros para emissão.

---

## Municípios e protocolos suportados

| Unidade | Cidade | Protocolo NFS-e | Webservice |
|---------|--------|-----------------|------------|
| Principal | Sorocaba-SP | DSF/IssDSF | `issdigitalsod.com.br` |
| Franquia | Campinas-SP | DSF/IssDSF | `issdigital.campinas.sp.gov.br` |

NF-e (ambas as unidades): SEFAZ-SP via protocolo NF-e 4.00.

**Nota:** O ambiente de homologação DSF só existe para São Luiz-MA. Testes de NFS-e precisam ser feitos em produção com notas reais (valores mínimos).

---

## Novos arquivos

### `server/services/cert.ts`
Carrega o certificado A1 (.pfx) a partir da env var `NFE_CERT_BASE64` (base64) e da senha `NFE_CERT_PASSWORD`. Exporta funções para assinar XML e obter credenciais SOAP.

### `server/services/nfe-sefaz.ts`
Comunicação com SEFAZ-SP para NF-e 4.00:
- Gera XML NF-e (já existe em `invoices.ts` como `generateInvoiceXml`)
- Assina XML com certificado A1 via `xml-crypto`
- Envia envelope SOAP para webservice SEFAZ-SP
- Parseia resposta: chave de acesso, protocolo, status
- Funções: `emitirNFe(invoice)`, `consultarNFe(chave)`, `cancelarNFe(chave, protocolo)`

### `server/services/nfse-dsf.ts`
Comunicação com prefeituras via protocolo DSF para NFS-e:
- Monta envelope SOAP DSF (LoteRps)
- Assina XML com certificado A1
- Seleciona endpoint baseado na cidade (`clientCity`)
- Parseia resposta: número NFS-e, XML, status
- Funções: `emitirNFSe(invoice)`, `cancelarNFSe(numero, cidade)`

---

## Dependências Node.js novas

| Pacote | Uso |
|--------|-----|
| `xml-crypto` | Assinatura digital XML (xmldsig) |
| `node-forge` | Leitura e parsing do certificado .pfx |
| `axios` | Chamadas SOAP (POST com Content-Type text/xml) |
| `fast-xml-parser` | Parse de respostas SOAP/XML do SEFAZ |

---

## Mudanças em `server/routes/invoices.ts`

### Remove
- Funções `nfeioHeaders()`, `nfeioBase()`, `nfeioBaseNfe()`
- Rota `POST /:id/emit` com chamadas `fetch('https://api.nfe.io/...')`
- Rota `GET /:id/nfeio-status` com polling nfe.io

### Adiciona
- Rota `POST /:id/emit` chama `emitirNFe()` ou `emitirNFSe()` conforme `invoice.type`
- Rota `GET /:id/status` consulta SEFAZ/prefeitura diretamente
- Rota `POST /:id/cancel` cancela no SEFAZ/prefeitura

### Schema — campos renomeados

| Campo antigo (nfe.io) | Campo novo (genérico) |
|---|---|
| `nfeioId` | `emissaoId` |
| `nfeioStatus` | `emissaoStatus` |
| `nfeioNumber` | `numeroNF` |
| `nfeioPdfUrl` | `pdfUrl` |
| `nfeioXmlUrl` | `xmlUrl` |
| `nfeioAccessKey` | `chaveAcesso` |
| `nfeioProtocol` | `protocolo` |
| `nfeioRawResponse` | `emissaoResposta` |

Script de migração MongoDB renomeia campos em documentos existentes.

---

## Gestão do certificado no Coolify

1. Converter `.pfx` para base64: `base64 -w 0 cert.pfx`
2. Adicionar env var `NFE_CERT_BASE64` no container Node.js no Coolify
3. Adicionar env var `NFE_CERT_PASSWORD` com a senha do certificado
4. Remover env vars `NFEIO_API_KEY`, `NFEIO_COMPANY_ID_NFSE`, `NFEIO_COMPANY_ID_NFE`

---

## Variáveis de ambiente

| Var | Descrição |
|-----|-----------|
| `NFE_CERT_BASE64` | Certificado .pfx em base64 |
| `NFE_CERT_PASSWORD` | Senha do certificado |
| `NFE_AMBIENTE` | `homologacao` ou `producao` (default: `producao`) |
| `NFSE_SOROCABA_URL` | URL webservice Sorocaba (hardcoded fallback disponível) |
| `NFSE_CAMPINAS_URL` | URL webservice Campinas (hardcoded fallback disponível) |

---

## Frontend (`NotasFiscais.tsx`)

Mudanças mínimas:
- Substituir referências a campos `nfeio*` pelos campos novos (`chaveAcesso`, `numeroNF`, etc.)
- Remover textos "via nfe.io" dos badges e botões
- Manter mesma lógica de polling de status (endpoint muda, comportamento igual)

---

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| DSF abandonado: prefeitura muda webservice | URLs configuráveis via env var; fácil de atualizar |
| Sem homologação NFS-e para Sorocaba/Campinas | Testar com nota de valor mínimo (R$0,01) em produção |
| XML NF-e rejeitado pelo SEFAZ | Usar ambiente de homologação SEFAZ (`NFE_AMBIENTE=homologacao`) para NF-e antes de ir para produção |
| Certificado expira | Alertar com 30 dias de antecedência (verificar validade no `cert.ts` no startup) |

---

## Fora do escopo

- Cancelamento automático (implementar manualmente via rota)
- Inutilização de numeração
- Carta de correção (CC-e)
- NFC-e
