import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';
import { t } from '../../utils/i18n';

const langs: { code: Language; flag: string; country: string }[] = [
  { code: 'ar', flag: '🇪🇬', country: 'مصر' },
  { code: 'en', flag: '🇬🇧', country: 'UK' },
  { code: 'ru', flag: '🇷🇺', country: 'Россия' },
];

export default function LanguageGate() {
  const { chooseLang, lang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[80] bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="label-luxury mb-3">Sushi Shop Egypt</p>
        <h1 className="font-display text-4xl text-white mb-2">{t('lang.title', lang)}</h1>
        <p className="text-white/50 mb-10">{t('lang.subtitle', lang)}</p>
        <div className="space-y-3">
          {langs.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => chooseLang(l.code)}
              className="w-full card p-5 flex items-center gap-5 hover:border-accent/50 transition-colors text-start"
            >
              <span className="text-5xl leading-none" aria-hidden>{l.flag}</span>
              <span>
                <span className="block font-display text-2xl text-white">{t(`lang.${l.code}`, lang)}</span>
                <span className="text-white/40 text-sm">{l.country}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
