import { useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const { lang } = useLanguage();

  useEffect(() => {
    const id = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div className="splash-screen flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="ambient-glow fixed inset-0" />
      <div className="absolute top-5 end-5 z-10">
        <ThemeToggle compact />
      </div>
      <div className="relative z-10 animate-fade-up">
        <BrandMark size="hero" />
        <p className="label-luxury mt-6 mb-3">Sushi Shop Egypt</p>
        <h1 className="font-display text-3xl sm:text-5xl text-fg max-w-xl">{t('splash.tagline', lang)}</h1>
        <button type="button" onClick={onDone} className="btn-luxury-filled mt-10">
          {t('splash.continue', lang)}
        </button>
      </div>
    </div>
  );
}
