import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@soul540/contracts';
import { apiFetch } from '../lib/api';
import { storage } from '../lib/storage';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiFetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.user) {
          storage.setUser(data.user);
          setUser(data.user);
          return;
        }
        storage.clear();
        setUser(null);
      })
      .catch(() => {
        if (!active) return;
        storage.clear();
        setUser(null);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const endSession = () => {
      storage.clear();
      setUser(null);
    };

    window.addEventListener('soul540:unauthorized', endSession);
    return () => window.removeEventListener('soul540:unauthorized', endSession);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email ou senha incorretos');
    }
    const data = await response.json();
    storage.setUser(data.user);
    setUser(data.user);
  };

  const logout = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
