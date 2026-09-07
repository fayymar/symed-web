'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });

const listeners = new Set<() => void>();
let cachedTheme: Theme | null = null;

function readTheme(): Theme {
  const saved = localStorage.getItem('symed_theme') as Theme | null;
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return saved || preferred;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Хранит и применяет тему без лишнего рендера в эффекте — читается один раз при
// первом обращении на клиенте, дальше меняется только через setThemeValue().
function getSnapshot(): Theme {
  if (cachedTheme === null) {
    cachedTheme = readTheme();
    document.documentElement.setAttribute('data-theme', cachedTheme);
  }
  return cachedTheme;
}

// На сервере localStorage/matchMedia недоступны — используем нейтральный дефолт,
// совпадающий с тем, что увидит клиент при первом рендере до гидратации.
function getServerSnapshot(): Theme {
  return 'light';
}

function setThemeValue(next: Theme) {
  localStorage.setItem('symed_theme', next);
  document.documentElement.setAttribute('data-theme', next);
  cachedTheme = next;
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    setThemeValue(theme === 'light' ? 'dark' : 'light');
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
