import { Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import SiteLogo from './SiteLogo';

export default function Header() {
  const { lang } = useLanguage();
  const { type, user } = useAuth();
  const { count } = useCart();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/85 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <SiteLogo to="/" size="sm" />

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
            {t('nav.home', lang)}
          </Link>
          {type === 'customer' && (
            <>
              <Link to="/orders" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
                {t('nav.orders', lang)}
              </Link>
              <Link to="/chat" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
                {t('nav.chat', lang)}
              </Link>
              <Link to="/profile" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-accent transition-colors">
                {(user as { full_name?: string })?.full_name || t('nav.profile', lang)}
              </Link>
            </>
          )}
          {type !== 'customer' && (
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
          <Link to={type === 'customer' ? '/profile' : '/login'} className="md:hidden text-white/80 hover:text-accent">
            {type === 'customer' ? <User className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 hidden" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
