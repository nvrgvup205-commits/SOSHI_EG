import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';
import FlagIcon from './FlagIcon';

const langs: { code: Language; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export default function LanguageSwitcher({ dark = false, onDark = false }: { dark?: boolean; onDark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${dark || onDark ? '' : 'lang-switch'}`} dir="ltr">
      {langs.map((item) => {
        const active = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            aria-label={item.label}
            aria-current={active ? 'true' : undefined}
            className={`p-0.5 rounded-full transition-all duration-200 ${
              active
                ? 'ring-1 ring-amber-500/50 shadow-[0_0_8px_rgba(234,179,8,0.35)]'
                : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-amber-500/25'
            }`}
          >
            <FlagIcon lang={item.code} className="w-6 h-6" />
          </button>
        );
      })}
    </div>
  );
}
