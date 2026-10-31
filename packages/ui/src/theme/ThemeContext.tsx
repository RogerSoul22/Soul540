import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextData {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('soul540-theme') as Theme) ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soul540-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-switching');
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    setTimeout(() => document.documentElement.classList.remove('theme-switching'), 300);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
