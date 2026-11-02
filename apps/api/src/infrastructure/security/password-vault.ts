import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { getJwtSecret } from './jwt-secret';

// Cofre de senhas: guarda uma cópia CRIPTOGRAFADA (AES-256-GCM) para o próprio usuário poder ver a senha dele.
// O login continua usando só o hash bcrypt. A chave vem de PASSWORD_VAULT_KEY; sem ela, deriva-se do JWT_SECRET.
const SALT = 'soul540-password-vault-v1';
let cachedKey: { source: string; key: Buffer } | null = null;

function vaultKey(): Buffer {
  const source = process.env.PASSWORD_VAULT_KEY?.trim() || getJwtSecret();
  if (cachedKey?.source !== source) cachedKey = { source, key: scryptSync(source, SALT, 32) };
  return cachedKey.key;
}

export function encryptPassword(password: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', vaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
}

// Devolve null se o valor estiver ausente, adulterado ou criptografado com outra chave.
export function decryptPassword(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', vaultKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
