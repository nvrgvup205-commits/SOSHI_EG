import { useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import BrandMark from './BrandMark';
import SushiStage from './SushiStageLazy';
import ThemeToggle from './ThemeToggle';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const { lang } = useLanguage();

  useEffect(() => {
    const id = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div className="splash-screen">
      <SushiStage />
      <div className="splash-veil" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="absolute top-5 end-5">
          <ThemeToggle compact />
        </div>
        <div className="logo-plate mb-8">
          <BrandMark size="hero" />
        </div>
        <p className="label-luxury mb-3">Sushi Shop Egypt</p>
        <h1 className="font-display text-4xl sm:text-6xl text-fg max-w-xl">{t('splash.tagline', lang)}</h1>
        <button type="button" onClick={onDone} className="btn-luxury-filled mt-10">
          {t('splash.continue', lang)}
        </button>
        <button type="button" onClick={onDone} className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
          {t('splash.skip', lang)}
        </button>
      </div>
    </div>
  );
}
