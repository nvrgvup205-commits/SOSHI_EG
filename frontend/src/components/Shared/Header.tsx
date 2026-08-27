import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import SiteLogo from './SiteLogo';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { lang } = useLanguage();
  const { type, user } = useAuth();
  const { count } = useCart();

  return (
    <header className="app-header">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <SiteLogo to="/" size="sm" />

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link">
            {t('nav.home', lang)}
          </Link>
          {type === 'customer' && (
            <>
              <Link to="/orders" className="nav-link">{t('nav.orders', lang)}</Link>
              <Link to="/chat" className="nav-link">{t('nav.chat', lang)}</Link>
              <Link to="/profile" className="nav-link">
                {(user as { full_name?: string })?.full_name || t('nav.profile', lang)}
              </Link>
            </>
          )}
          {type !== 'customer' && (
            <Link to="/login" className="nav-link">{t('nav.login', lang)}</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher dark />
          <ThemeToggle compact />
          <Link to="/cart" className="relative text-fg hover:text-accent transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -end-2 w-4 h-4 bg-accent text-ink text-[10px] font-bold flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </Link>
          <Link to={type === 'customer' ? '/profile' : '/login'} className="md:hidden text-fg hover:text-accent">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
