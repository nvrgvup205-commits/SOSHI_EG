import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';

const langs: { code: Language; label: string }[] = [
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'РУ' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-1 bg-cream rounded-lg p-1">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${
            lang === l.code
              ? 'bg-secondary text-white'
              : 'text-gray-500 hover:text-secondary'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
