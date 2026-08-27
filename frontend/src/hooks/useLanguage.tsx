import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Language } from '../types';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  chooseLang: (lang: Language) => void;
  hasChosen: boolean;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageState | null>(null);

const CUSTOMER_LANG_KEY = 'lang';
const STAFF_LANG_KEY = 'staff_lang';
const LANG_CHOSEN_KEY = 'lang_chosen';

function isStaffRoute(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/staff');
}

function readLang(key: string, fallback: Language): Language {
  const stored = localStorage.getItem(key) as Language | null;
  if (stored === 'ar' || stored === 'en' || stored === 'ru') return stored;
  return fallback;
}

function applyDocumentLang(l: Language) {
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const staffRoute = isStaffRoute(location.pathname);
  const storageKey = staffRoute ? STAFF_LANG_KEY : CUSTOMER_LANG_KEY;
  const fallback: Language = staffRoute ? 'ar' : 'ar';

  const [lang, setLangState] = useState<Language>(() => readLang(storageKey, fallback));
  const [hasChosen, setHasChosen] = useState(() => localStorage.getItem(LANG_CHOSEN_KEY) === '1');

  useEffect(() => {
    const next = readLang(storageKey, fallback);
    setLangState(next);
    applyDocumentLang(next);
  }, [storageKey, fallback]);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(storageKey, l);
    applyDocumentLang(l);
  };

  const chooseLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(CUSTOMER_LANG_KEY, l);
    localStorage.setItem(LANG_CHOSEN_KEY, '1');
    setHasChosen(true);
    applyDocumentLang(l);
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
