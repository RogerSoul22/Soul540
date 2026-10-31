import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { getMainCertificateService } from '../modules/fiscal/main-certificate.service';

export interface LegacyCertificateInput {
  certificateBase64: string;
  password: string;
}

export function readLegacyCertificateEnv(env: Record<string, string | undefined>): LegacyCertificateInput | null {
  const certificateBase64 = env.NFE_CERT_BASE64?.trim();
  const password = env.NFE_CERT_PASSWORD;
  if (!certificateBase64 || !password) return null;
  return { certificateBase64, password };
}

async function run() {
  await connectDatabase();
  const legacy = readLegacyCertificateEnv(process.env);
  if (!legacy) {
    console.log('Nenhum certificado legado completo foi encontrado no ambiente.');
    await mongoose.disconnect();
    return;
  }

  const service = getMainCertificateService();
  await service.ensureLegacyMainCertificateImported();
  const summary = await service.getMainCertificateSummary();
  console.log(`Certificado principal migrado. Validade: ${summary.validUntil ?? 'não informada'}.`);
  await mongoose.disconnect();
}

if (/migrate-main-certificate\.(ts|js)$/.test(process.argv[1] || '')) {
  run().catch(async (error) => {
    console.error(`Falha ao migrar certificado principal: ${error instanceof Error ? error.message : String(error)}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}
