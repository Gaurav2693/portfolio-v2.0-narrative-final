import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to night mode'} aria-pressed={dark} title={dark ? 'Light mode' : 'Night mode'}
      className={`relative flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-ink hover:text-ink ${className}`}>
      <Sun size={16} className={`absolute transition-all duration-300 ${dark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
      <Moon size={16} className={`absolute transition-all duration-300 ${dark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
    </button>
  );
}
