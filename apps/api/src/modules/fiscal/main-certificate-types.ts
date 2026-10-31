export interface MainCertificateSummary {
  configured: boolean;
  configuredAt?: string;
  validUntil?: string;
  certificateCnpj?: string;
  certificateHolder?: string;
}

export interface OpenedMainCertificate {
  pfxBase64: string;
  password: string;
  validUntil: Date;
  certificateCnpj?: string;
  certificateHolder?: string;
}
