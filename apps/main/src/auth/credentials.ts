export type LoginCredentials = {
  email: string;
  password: string;
};

export function validateLoginCredentials({ email, password }: LoginCredentials) {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!email || !validEmail) throw new Error('Email invalido');
  if (!password || password.length < 6) throw new Error('Senha deve ter pelo menos 6 caracteres');
}
