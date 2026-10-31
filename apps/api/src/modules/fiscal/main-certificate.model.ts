import mongoose, { Schema, type Model } from 'mongoose';

export interface MainCertificateRecord {
  key: 'main';
  pfxEncrypted?: string;
  passwordEncrypted?: string;
  configuredAt?: Date;
  validUntil?: Date;
  certificateCnpj?: string;
  certificateHolder?: string;
  legacyMigrationCompleted: boolean;
}

const schema = new Schema<MainCertificateRecord>(
  {
    key: { type: String, enum: ['main'], required: true, unique: true },
    pfxEncrypted: { type: String },
    passwordEncrypted: { type: String },
    configuredAt: { type: Date },
    validUntil: { type: Date },
    certificateCnpj: { type: String },
    certificateHolder: { type: String },
    legacyMigrationCompleted: { type: Boolean, default: false },
  },
  { collection: 'mainfiscalcertificates', versionKey: false },
);

export const MainCertificateModel = (mongoose.models.MainFiscalCertificate ||
  mongoose.model<MainCertificateRecord>('MainFiscalCertificate', schema)) as Model<MainCertificateRecord>;
