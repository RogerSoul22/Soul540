const MIN_JWT_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET deve ter pelo menos ${MIN_JWT_SECRET_LENGTH} caracteres`);
  }
  return secret;
}
