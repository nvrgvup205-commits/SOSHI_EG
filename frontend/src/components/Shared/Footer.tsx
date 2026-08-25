import BrandName from './BrandName';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-black border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <BrandName size="md" />
        </div>
        <p className="text-white/40 text-sm tracking-wide">
          © 2026 — {t('hero.subtitle', lang)}
        </p>
      </div>
    </footer>
  );
}
