/** 主题上下文：支持系统、深色、浅色与跨标签页同步。 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'system' | 'light' | 'dark';
type ThemeState = { theme: Theme; resolvedTheme: 'light' | 'dark' | undefined; setTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeState | null>(null);
function parseTheme(value: string | null): Theme {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>();
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    let current: Theme = 'system';
    const apply = () => {
      const mode = current === 'system' ? (media.matches ? 'dark' : 'light') : current;
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.style.colorScheme = mode;
      updateTheme(current);
      setResolvedTheme(mode);
    };
    const read = () => {
      try { current = parseTheme(localStorage.getItem('theme')); } catch { current = 'system'; }
      apply();
    };
    const change = (event: Event) => { current = (event as CustomEvent<Theme>).detail; apply(); };
    read();
    media.addEventListener('change', apply);
    window.addEventListener('storage', read);
    window.addEventListener('site-theme', change);
    return () => {
      media.removeEventListener('change', apply);
      window.removeEventListener('storage', read);
      window.removeEventListener('site-theme', change);
    };
  }, []);
  const setTheme = (value: Theme) => {
    try { localStorage.setItem('theme', value); } catch { /* 禁用存储时仍可切换当前页面。 */ }
    window.dispatchEvent(new CustomEvent('site-theme', { detail: value }));
  };
  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme 需要 ThemeProvider');
  return context;
}
