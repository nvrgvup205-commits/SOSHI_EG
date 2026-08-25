import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { lang } = useLanguage();
  const { type, user } = useAuth();
  const { count } = useCart();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="group">
          <div className="text-lg font-display tracking-[0.2em] uppercase text-white group-hover:text-accent transition-colors">
            Sushi Shop
          </div>
          <div className="text-[10px] tracking-[0.4em] text-accent/80 uppercase">Egypt</div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link to="/#menu" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
            {t('nav.products', lang)}
          </Link>
          {type === 'customer' ? (
            <span className="text-xs text-white/50">{(user as { full_name?: string })?.full_name}</span>
          ) : (
            <Link to="/login" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
              {t('nav.login', lang)}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher dark />
          <Link to="/cart" className="relative text-white/80 hover:text-accent transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -end-2 w-4 h-4 bg-accent text-ink text-[10px] font-bold flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
