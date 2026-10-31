import * as forge from 'node-forge';

export interface ParsedPfxCertificate {
  privateKey: forge.pki.rsa.PrivateKey;
  certificate: forge.pki.Certificate;
}

function matchesPrivateKey(privateKey: forge.pki.rsa.PrivateKey, certificate: forge.pki.Certificate): boolean {
  const publicKey = certificate.publicKey as forge.pki.rsa.PublicKey;
  return (
    Boolean(publicKey.n && publicKey.e && privateKey.n && privateKey.e) &&
    publicKey.n.toString(16) === privateKey.n.toString(16) &&
    publicKey.e.toString(16) === privateKey.e.toString(16)
  );
}

export function parsePfxCertificate(certificateBase64: string, password: string): ParsedPfxCertificate {
  const pfxDer = Buffer.from(certificateBase64.replace(/\s/g, ''), 'base64');
  if (!pfxDer.length) throw new Error('arquivo vazio');
  const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxDer));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

  let privateKey: forge.pki.rsa.PrivateKey | undefined;
  const certificates: forge.pki.Certificate[] = [];
  for (const safeContents of pfx.safeContents) {
    for (const safeBag of safeContents.safeBags) {
      const isPrivateKey =
        safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag || safeBag.type === forge.pki.oids.keyBag;
      if (isPrivateKey && safeBag.key) {
        privateKey = safeBag.key as forge.pki.rsa.PrivateKey;
      }
      if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) certificates.push(safeBag.cert);
    }
  }

  const certificate = privateKey && certificates.find((item) => matchesPrivateKey(privateKey!, item));
  if (!privateKey || !certificate) {
    throw new Error('certificado e chave privada correspondentes não encontrados no .pfx.');
  }
  return { privateKey, certificate };
}
