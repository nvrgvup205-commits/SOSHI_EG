import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Language } from '../types';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  chooseLang: (lang: Language) => void;
  hasChosen: boolean;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageState | null>(null);

function readStoredLang(): Language {
  const stored = localStorage.getItem('lang') as Language | null;
  if (stored === 'ar' || stored === 'en' || stored === 'ru') return stored;
  return 'ar';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLang);
  const [hasChosen, setHasChosen] = useState(() => localStorage.getItem('lang_chosen') === '1');

  const apply = (l: Language) => {
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  };

  useEffect(() => {
    apply(lang);
  }, [lang]);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    apply(l);
  };

  const chooseLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('lang_chosen', '1');
    setHasChosen(true);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, chooseLang, hasChosen, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
