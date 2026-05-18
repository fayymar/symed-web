'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition ${className}`}
      style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark'
        ? <Sun size={16} strokeWidth={2} />
        : <Moon size={16} strokeWidth={2} />}
    </button>
  );
}
