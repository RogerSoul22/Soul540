import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import type { User } from '../../../../packages/contracts/src/index';
import { AuthRepository } from '../auth/auth-repository';
import { validateLoginCredentials } from '../auth/credentials';
import { tokenStorage } from '../auth/token-storage';

type AuthContextData = {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  isAdmin: boolean;
  permissions: string[];
  franchiseId?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: false,
  authenticated: false,
  isAdmin: false,
  permissions: [],
  login: async () => {},
  logout: async () => {},
});

const authRepository = new AuthRepository();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authRepository
      .getCurrentUser()
      .then((storedUser) => storedUser && setUser(storedUser))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const endSession = () => {
      tokenStorage.clear();
      setUser(null);
    };

    window.addEventListener('soul540:unauthorized', endSession);
    return () => window.removeEventListener('soul540:unauthorized', endSession);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      validateLoginCredentials({ email, password });
      const result = await authRepository.login({ email, password });
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authRepository.logout();
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    authenticated: Boolean(user),
    isAdmin: user?.isAdmin ?? false,
    permissions: user?.permissions ?? [],
    franchiseId: user?.franchiseId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
