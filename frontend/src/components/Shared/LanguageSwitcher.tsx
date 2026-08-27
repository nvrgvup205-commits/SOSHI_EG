import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';

const langs: { code: Language; flag: string; label: string }[] = [
  { code: 'ar', flag: '🇪🇬', label: 'AR' },
  { code: 'en', flag: '🇬🇧', label: 'EN GB' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
];

export default function LanguageSwitcher({ dark = false, onDark = false }: { dark?: boolean; onDark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex gap-1 ${dark || onDark ? '' : 'lang-switch'}`}>
      {langs.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLang(item.code)}
          className={`px-2 py-1 text-[10px] font-medium tracking-wider transition-all flex items-center gap-1 ${
            lang === item.code
              ? 'text-accent border-b border-accent'
              : onDark
                ? 'text-white/60 hover:text-white'
                : 'text-muted hover:text-fg'
          }`}
        >
          <span aria-hidden>{item.flag}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
