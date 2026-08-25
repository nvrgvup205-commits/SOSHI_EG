import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { t } from '../../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { lang } = useLanguage();
  const { type, user } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍣</span>
          <div>
            <div className="font-heading font-bold text-secondary text-lg leading-tight">SUSHI SHOP</div>
            <div className="text-xs font-bold text-primary tracking-widest">EGYPT</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
            {t('nav.home', lang)}
          </Link>
          <Link to="/#products" className="text-gray-700 hover:text-primary transition-colors font-medium">
            {t('nav.products', lang)}
          </Link>
          {type === 'customer' ? (
            <span className="text-sm text-gray-500">{(user as { full_name?: string })?.full_name || (user as { email?: string })?.email}</span>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-primary transition-colors font-medium">
              {t('nav.login', lang)}
            </Link>
          )}
          <Link to="/admin" className="text-xs text-gray-400 hover:text-secondary">Admin</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-cream transition-colors">
            <ShoppingCart className="w-5 h-5 text-secondary" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2 animate-slide-up">
          <Link to="/" className="block py-2" onClick={() => setMenuOpen(false)}>{t('nav.home', lang)}</Link>
          <Link to="/#products" className="block py-2" onClick={() => setMenuOpen(false)}>{t('nav.products', lang)}</Link>
          <Link to="/login" className="block py-2" onClick={() => setMenuOpen(false)}>{t('nav.login', lang)}</Link>
        </div>
      )}
    </header>
  );
}
