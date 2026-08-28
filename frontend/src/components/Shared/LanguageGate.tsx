import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';
import { t } from '../../utils/i18n';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';

const langs: { code: Language; flag: string }[] = [
  { code: 'ar', flag: '🇪🇬' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'ru', flag: '🇷🇺' },
];

export default function LanguageGate() {
  const { chooseLang, lang } = useLanguage();

  return (
    <div className="splash-screen flex min-h-screen items-center justify-center px-6 py-16">
      <div className="ambient-glow fixed inset-0" />
      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="flex justify-end mb-6">
          <ThemeToggle compact />
        </div>
        <BrandMark size="lg" className="mx-auto mb-8" />
        <p className="label-luxury mb-3">Sushi Shop Egypt</p>
        <h1 className="font-display text-3xl text-fg mb-2">{t('lang.title', lang)}</h1>
        <p className="text-muted mb-10">{t('gate.pick', lang)}</p>
        <div className="space-y-3">
          {langs.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => chooseLang(item.code)}
              className="glass-card w-full p-5 flex items-center gap-5 text-start hover:border-accent/50 transition-colors rounded-2xl"
            >
              <span className="text-4xl leading-none" aria-hidden>{item.flag}</span>
              <span>
                <span className="block font-display text-xl text-fg">{t(`lang.${item.code}`, lang)}</span>
                <span className="text-muted text-sm">{t(`lang.flag.${item.code}`, lang)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
