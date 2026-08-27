import BrandMark from './BrandMark';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="logo-plate">
            <BrandMark size="md" />
          </div>
        </div>
        <p className="text-muted text-sm tracking-wide">
          © 2026 — {t('hero.subtitle', lang)}
        </p>
      </div>
    </footer>
  );
}
