import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="text-2xl mb-2">🍣</div>
        <div className="font-heading font-bold text-lg">SUSHI SHOP EGYPT</div>
        <p className="text-white/60 text-sm mt-2">
          © 2026 Sushi Shop Egypt. {t('hero.subtitle', lang)}
        </p>
      </div>
    </footer>
  );
}
