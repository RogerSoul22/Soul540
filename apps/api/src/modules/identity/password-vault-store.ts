import { encryptPassword } from '../../infrastructure/security/password-vault';
import mongoose from 'mongoose';

// Guarda a cópia criptografada da senha, para o usuário poder vê-la em Minha conta. Falha aqui nunca derruba
// o login nem o cadastro: no pior caso a senha só aparece depois do próximo login.
export async function rememberPassword(userId: unknown, password: string): Promise<void> {
  try {
    await mongoose.models.User.updateOne({ _id: userId }, { passwordVault: encryptPassword(password) });
  } catch (error) {
    console.error('Não foi possível guardar a senha no cofre:', (error as Error).message);
  }
}
