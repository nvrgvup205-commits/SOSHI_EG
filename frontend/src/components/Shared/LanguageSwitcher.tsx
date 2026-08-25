import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';

const langs: { code: Language; label: string }[] = [
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex gap-1 ${dark ? '' : 'bg-cream rounded-lg p-1'}`}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1 text-[10px] font-medium tracking-wider transition-all ${
            lang === l.code
              ? dark ? 'text-accent border-b border-accent' : 'bg-secondary text-white'
              : dark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-secondary'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
