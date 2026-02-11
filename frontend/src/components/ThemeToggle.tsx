import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  className?: string
}

export function ThemeToggle({ theme, onThemeChange, className = '' }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`
        p-2.5 rounded-xl border transition-all duration-300
        hover:scale-105 active:scale-95
        ${theme === 'dark'
          ? 'bg-amber-500/10 border-amber-400/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/20'
          : 'bg-slate-200/50 border-slate-400/30 text-slate-600 hover:bg-slate-300/50 hover:border-slate-500/50 hover:shadow-md'
        }
        ${className}
      `}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}
