import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLanguage();
  const label = theme === 'dark' ? t('theme.light', lang) : t('theme.dark', lang);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={t('theme.toggle', lang)}
      title={label}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {!compact && <span>{label}</span>}
    </button>
  );
}
