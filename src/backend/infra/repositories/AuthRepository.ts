import type { User } from '@backend/domain/entities/User';
import type { IAuthRepository, LoginCredentials, AuthResult } from '@backend/domain/repositories/IAuthRepository';
import { TokenStorage } from '../storage/TokenStorage';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Email ou senha incorretos');
    }
    const data = await res.json();
    TokenStorage.setUser(data.user);
    return { user: data.user, token: '' };
  }

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    TokenStorage.clear();
  }

  async getCurrentUser(): Promise<User | null> {
    const cached = TokenStorage.getUser<User>();
    if (cached) return cached;
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      TokenStorage.setUser(data.user);
      return data.user;
    } catch {
      return null;
    }
  }
}
