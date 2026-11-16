/** 读者偏好：持久化纸张、动效和阅读排版；实验参数留在 sketchbook。 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type Preferences = { pattern: string; motion: boolean; size: number; leading: number };
const defaults: Preferences = { pattern: 'dots', motion: true, size: 16, leading: 1.95 };
const key = 'weblog-reading-preferences';
const patterns = ['dots', 'grid', 'cross', 'ruled', 'plain'];
function parse(value: string | null): Preferences {
  try {
    const data = JSON.parse(value || '{}');
    return {
      pattern: patterns.includes(data.pattern) ? data.pattern : defaults.pattern,
      motion: typeof data.motion === 'boolean' ? data.motion : defaults.motion,
      size: typeof data.size === 'number' ? Math.max(14, Math.min(20, data.size)) : defaults.size,
      leading: typeof data.leading === 'number' ? Math.max(1.6, Math.min(2.2, data.leading)) : defaults.leading,
    };
  } catch { return defaults; }
}
const Context = createContext<{
  preferences: Preferences; update: (value: Partial<Preferences>) => void; reduced: boolean;
} | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaults);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => { try { setPreferences(parse(localStorage.getItem(key))); } catch { setPreferences(defaults); } };
    const motion = () => setSystemReduced(media.matches);
    read(); motion();
    window.addEventListener('storage', read);
    media.addEventListener('change', motion);
    return () => { window.removeEventListener('storage', read); media.removeEventListener('change', motion); };
  }, []);
  const update = (value: Partial<Preferences>) => setPreferences(old => {
    const next = { ...old, ...value };
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* 存储禁用时保留本页设置。 */ }
    return next;
  });
  return <Context.Provider value={{ preferences, update, reduced: systemReduced || !preferences.motion }}>{children}</Context.Provider>;
}
export function usePreferences() {
  const context = useContext(Context);
  if (!context) throw new Error('usePreferences 需要 PreferencesProvider');
  return context;
}
