import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';
import { t } from '../../utils/i18n';
import BrandMark from './BrandMark';
import FlagIcon from './FlagIcon';
import LogoHalo from './LogoHalo';
import ThemeToggle from './ThemeToggle';

const langs: { code: Language; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export default function LanguageGate() {
  const { chooseLang, lang } = useLanguage();
  const navigate = useNavigate();

  const pick = (code: Language) => {
    chooseLang(code);
    navigate('/login', { replace: true });
  };

  return (
    <div className="splash-screen h-dvh max-h-dvh overflow-hidden flex flex-col py-4 px-6 pb-20">
      <div className="ambient-glow fixed inset-0 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto gap-3">
        <div className="flex justify-start shrink-0" dir="ltr">
          <ThemeToggle compact />
        </div>

        <div className="text-center shrink-0">
          <LogoHalo className="mx-auto mb-3">
            <BrandMark size="md" />
          </LogoHalo>
          <p className="label-luxury text-[10px] mb-1">SUSHI SHOP EGYPT</p>
          <h1 className="font-display text-xl text-fg mb-1">{t('lang.title', lang)}</h1>
          <p className="text-muted text-xs">{t('gate.pick', lang)}</p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {langs.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => pick(item.code)}
              className="glass-card w-full p-3 flex items-center gap-3 text-start hover:border-accent/50 transition-colors rounded-xl"
            >
              <FlagIcon lang={item.code} className="w-8 h-8" />
              <span>
                <span className="block font-display text-base text-fg">{t(`lang.${item.code}`, lang)}</span>
                <span className="text-muted text-xs">{t(`lang.flag.${item.code}`, lang)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
