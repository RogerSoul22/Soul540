import { SecretCipher } from '../../infrastructure/crypto/secret-cipher';
import { MainCertificateModel, type MainCertificateRecord } from './main-certificate.model';
import { inspectPfx, type CertificateInspection } from './main-certificate-inspector';
import type { MainCertificateSummary, OpenedMainCertificate } from './main-certificate-types';

export class MainCertificateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MainCertificateValidationError';
  }
}

export interface MainCertificateModelLike {
  findOne(filter: Record<string, unknown>): Promise<MainCertificateRecord | null>;
  create(value: Record<string, unknown>): Promise<MainCertificateRecord>;
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<MainCertificateRecord | null>;
}

interface MainCertificateServiceDependencies {
  model?: MainCertificateModelLike;
  cipher?: SecretCipher;
  inspect?: (certificateBase64: string, password: string) => CertificateInspection;
  now?: () => Date;
}

const FILTER = { key: 'main' };

export class MainCertificateService {
  private readonly model: MainCertificateModelLike;
  private readonly cipher: SecretCipher;
  private readonly inspect: (certificateBase64: string, password: string) => CertificateInspection;
  private readonly now: () => Date;

  constructor(dependencies: MainCertificateServiceDependencies = {}) {
    this.model = dependencies.model ?? MainCertificateModel;
    this.cipher = dependencies.cipher ?? new SecretCipher();
    this.inspect = dependencies.inspect ?? inspectPfx;
    this.now = dependencies.now ?? (() => new Date());
  }

  async getMainCertificateSummary(): Promise<MainCertificateSummary> {
    await this.ensureLegacyMainCertificateImported();
    return this.toSummary(await this.model.findOne(FILTER));
  }

  async saveMainCertificate(input: { certificateBase64: string; password: string }): Promise<MainCertificateSummary> {
    const certificateBase64 = input.certificateBase64.replace(/\s/g, '');
    if (!certificateBase64 || !input.password) {
      throw new MainCertificateValidationError('Certificado e senha são obrigatórios.');
    }

    let inspection: CertificateInspection;
    try {
      inspection = this.inspect(certificateBase64, input.password);
    } catch {
      throw new MainCertificateValidationError('Não foi possível ler o certificado A1. Verifique o arquivo e a senha.');
    }
    if (inspection.validUntil.getTime() <= this.now().getTime()) {
      throw new MainCertificateValidationError('Certificado A1 expirado.');
    }

    const configuredCnpj = String(process.env.NFE_CNPJ ?? '').replace(/\D/g, '');
    if (configuredCnpj && inspection.certificateCnpj && configuredCnpj !== inspection.certificateCnpj) {
      throw new MainCertificateValidationError('O CNPJ do certificado não corresponde ao CNPJ fiscal da matriz.');
    }

    const record = {
      key: 'main' as const,
      pfxEncrypted: this.cipher.encrypt(certificateBase64, 'main:pfx'),
      passwordEncrypted: this.cipher.encrypt(input.password, 'main:password'),
      configuredAt: this.now(),
      validUntil: inspection.validUntil,
      certificateCnpj: inspection.certificateCnpj,
      certificateHolder: inspection.certificateHolder,
      legacyMigrationCompleted: true,
    };
    const saved = await this.model.findOneAndUpdate(FILTER, { $set: record }, { new: true, upsert: true });
    return this.toSummary(saved ?? record);
  }

  async openMainCertificate(): Promise<OpenedMainCertificate> {
    await this.ensureLegacyMainCertificateImported();
    const record = await this.model.findOne(FILTER);
    if (!record?.pfxEncrypted || !record.passwordEncrypted || !record.validUntil) {
      throw new MainCertificateValidationError('Certificado digital A1 da matriz não configurado.');
    }
    if (record.validUntil.getTime() <= this.now().getTime()) {
      throw new MainCertificateValidationError('Certificado A1 expirado.');
    }
    return {
      pfxBase64: this.cipher.decrypt(record.pfxEncrypted, 'main:pfx'),
      password: this.cipher.decrypt(record.passwordEncrypted, 'main:password'),
      validUntil: record.validUntil,
      certificateCnpj: record.certificateCnpj,
      certificateHolder: record.certificateHolder,
    };
  }

  async removeMainCertificate(): Promise<void> {
    await this.model.findOneAndUpdate(
      FILTER,
      {
        $set: { key: 'main', legacyMigrationCompleted: true },
        $unset: {
          pfxEncrypted: 1,
          passwordEncrypted: 1,
          configuredAt: 1,
          validUntil: 1,
          certificateCnpj: 1,
          certificateHolder: 1,
        },
      },
      { new: true, upsert: true },
    );
  }

  async ensureLegacyMainCertificateImported(): Promise<void> {
    const current = await this.model.findOne(FILTER);
    if (current?.legacyMigrationCompleted || current?.pfxEncrypted || current?.passwordEncrypted) return;
    const certificateBase64 = process.env.NFE_CERT_BASE64;
    const password = process.env.NFE_CERT_PASSWORD;
    if (!certificateBase64 || password === undefined) return;
    await this.saveMainCertificate({ certificateBase64, password });
  }

  private toSummary(record: MainCertificateRecord | null): MainCertificateSummary {
    if (!record?.pfxEncrypted || !record.passwordEncrypted) return { configured: false };
    return {
      configured: true,
      configuredAt: record.configuredAt?.toISOString(),
      validUntil: record.validUntil?.toISOString(),
      certificateCnpj: record.certificateCnpj,
      certificateHolder: record.certificateHolder,
    };
  }
}

let defaultService: MainCertificateService | undefined;

export function getMainCertificateService(): MainCertificateService {
  defaultService ??= new MainCertificateService();
  return defaultService;
}
