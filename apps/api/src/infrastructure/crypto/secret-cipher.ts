import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export class SecretCipher {
  private readonly key: Buffer;

  constructor(keyHex = process.env.ENCRYPTION_KEY ?? '') {
    if (!/^[0-9a-fA-F]{64}$/.test(keyHex) || /^0+$/.test(keyHex)) {
      throw new Error('ENCRYPTION_KEY deve ter 64 caracteres hexadecimais');
    }
    this.key = Buffer.from(keyHex, 'hex');
  }

  encrypt(value: string, context: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    cipher.setAAD(Buffer.from(context, 'utf8'));
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string, context: string): string {
    const [version, ivHex, tagHex, encryptedHex] = payload.split(':');
    if (
      version !== 'v1' ||
      !/^[0-9a-f]+$/.test(ivHex ?? '') ||
      !/^[0-9a-f]+$/.test(tagHex ?? '') ||
      !/^[0-9a-f]+$/.test(encryptedHex ?? '') ||
      (ivHex?.length ?? 0) !== IV_LENGTH * 2 ||
      (tagHex?.length ?? 0) !== TAG_LENGTH * 2 ||
      !encryptedHex
    ) {
      throw new Error('formato inválido para segredo criptografado');
    }

    try {
      const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(ivHex, 'hex'));
      decipher.setAAD(Buffer.from(context, 'utf8'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
    } catch {
      throw new Error('não foi possível descriptografar o segredo');
    }
  }
}
