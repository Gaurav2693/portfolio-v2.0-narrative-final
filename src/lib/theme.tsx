import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });

function initial(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);
  // Follow the OS until the person picks one explicitly.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('theme'); } catch {}
    if (saved) return;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setTheme(m.matches ? 'dark' : 'light');
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return <ThemeCtx.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
