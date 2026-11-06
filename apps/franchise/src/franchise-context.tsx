import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from './lib/api';
import { useAuth } from './contexts/AuthContext';
import { getFranchiseSlug } from './franchise-path';

export type FranchisePortalData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  status: string;
};

type FranchiseContextValue = { franchise: FranchisePortalData | null; slug: string; loading: boolean };

const FranchiseContext = createContext<FranchiseContextValue>({
  franchise: null,
  slug: 'campinas',
  loading: true,
});

export function FranchiseProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const slug = getFranchiseSlug();
  const [franchise, setFranchise] = useState<FranchisePortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch(`/api/franchises/slug/${encodeURIComponent(slug)}`)
      .then((response) => response.json())
      .then(setFranchise)
      .catch(() => setFranchise(null))
      .finally(() => setLoading(false));
  }, [authenticated, slug]);

  return <FranchiseContext.Provider value={{ franchise, slug, loading }}>{children}</FranchiseContext.Provider>;
}

export const useFranchise = () => useContext(FranchiseContext);
