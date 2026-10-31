import type { User } from '@soul540/contracts';
import { apiFetch } from '../lib/api';
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

  async getCurrentUser(): Promise<User | null> {
    const cached = tokenStorage.getUser<User>();
    if (cached) return cached;

    try {
      const response = await apiFetch('/api/auth/me');
      const data = await response.json();
      tokenStorage.setUser(data.user);
      return data.user;
    } catch {
      return null;
    }
  }
}
