import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { AppContextData } from './app-context-types';
import { useMainAppContext } from './use-main-app-context';

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useMainAppContext();

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
}
