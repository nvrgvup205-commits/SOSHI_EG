import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-charcoal border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="label-luxury mb-4">Sushi Shop Egypt</div>
        <h3 className="font-display text-3xl text-white mb-4">Crafted by the sea</h3>
        <div className="divider-gold mb-6" />
        <p className="text-white/40 text-sm tracking-wide">
          © 2026 — {t('hero.subtitle', lang)}
        </p>
      </div>
    </footer>
  );
}
