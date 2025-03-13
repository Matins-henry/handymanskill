import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSystemDark: boolean;
}

const initialState: ThemeContextType = {
  theme: 'system',
  setTheme: () => null,
  isSystemDark: false,
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>('handymatch-theme', defaultTheme);
  const [isSystemDark, setIsSystemDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsSystemDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Apply the theme
    if (theme === 'system') {
      applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      applyTheme(theme);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  function applyTheme(mode: 'light' | 'dark') {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }

  const value = {
    theme,
    setTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};