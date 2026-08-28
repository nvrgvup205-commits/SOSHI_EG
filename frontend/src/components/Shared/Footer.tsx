import BrandMark from './BrandMark';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="py-6 px-4">
      <div className="flex items-center justify-center gap-3 text-muted text-xs">
        <BrandMark size="sm" className="opacity-95" />
        <span>© 2026 — {t('hero.subtitle', lang)}</span>
      </div>
    </footer>
  );
}
