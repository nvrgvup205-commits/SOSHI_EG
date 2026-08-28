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
const LANG_COOKIE = 'soshi_lang';

function isStaffRoute(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/staff');
}

function readCookieLang(): Language | null {
  const match = document.cookie.match(/(?:^|; )soshi_lang=(ar|en|ru)/);
  return match ? (match[1] as Language) : null;
}

function writeLangCookie(lang: Language) {
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`;
}

function readLang(key: string, fallback: Language): Language {
  const stored = localStorage.getItem(key) as Language | null;
  if (stored === 'ar' || stored === 'en' || stored === 'ru') return stored;
  const cookie = readCookieLang();
  if (cookie) return cookie;
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
  const [hasChosen, setHasChosen] = useState(
    () => localStorage.getItem(LANG_CHOSEN_KEY) === '1' || Boolean(readCookieLang()),
  );

  useEffect(() => {
    const next = readLang(storageKey, fallback);
    setLangState(next);
    applyDocumentLang(next);
  }, [storageKey, fallback]);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(storageKey, l);
    writeLangCookie(l);
    applyDocumentLang(l);
  };

  const chooseLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(CUSTOMER_LANG_KEY, l);
    localStorage.setItem(LANG_CHOSEN_KEY, '1');
    writeLangCookie(l);
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
