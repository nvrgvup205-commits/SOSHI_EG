import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../utils/i18n';

export default function FloatingCartBar() {
  const { count, total } = useCart();
  const { lang } = useLanguage();
  const { type } = useAuth();
  const location = useLocation();

  if (type !== 'customer' || count === 0) return null;
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) return null;
  if (location.pathname === '/cart' || location.pathname === '/checkout') return null;

  return (
    <div
      className="fixed z-50 inset-x-4 md:inset-x-auto md:start-1/2 md:-translate-x-1/2 md:max-w-md animate-fade-up"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
    >
      <Link
        to="/cart"
        className="floating-cart-bar flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl shadow-2xl"
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingBag className="w-5 h-5 text-emerald-950" />
            <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-emerald-950 text-accent text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          </span>
          <span className="text-sm font-medium text-emerald-950">
            {count} {t('cart.items', lang)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="font-display text-lg text-emerald-950">
            {total.toFixed(0)} {t('currency', lang)}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-900/80 border border-emerald-900/20 px-3 py-1 rounded-full">
            {t('cart.view', lang)}
          </span>
        </span>
      </Link>
    </div>
  );
}
