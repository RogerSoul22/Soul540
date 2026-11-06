import type { User } from '../../../../packages/contracts/src/index';
import { ApiRequestError, apiFetch } from '../lib/api';
import { tokenStorage } from './token-storage';
import type { LoginCredentials } from './credentials';

type AuthResult = { user: User; token: string };

export class AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    tokenStorage.setUser(data.user);
    return { user: data.user, token: '' };
  }

  async logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    tokenStorage.clear();
  }

  // O servidor decide quem pode entrar neste sistema: o usuário guardado no navegador nunca basta, senão uma
  // sessão de outro sistema (Campinas, Fábrica) entraria aqui só porque o navegador é o mesmo.
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiFetch('/api/auth/me');
      const data = await response.json();
      tokenStorage.setUser(data.user);
      return data.user;
    } catch (error) {
      // Sem conexão com o servidor: mantém o usuário guardado. Sessão expirada ou acesso a outro sistema: sai.
      if (error instanceof ApiRequestError && error.status === 0) return tokenStorage.getUser<User>();
      tokenStorage.clear();
      return null;
    }
  }
}
