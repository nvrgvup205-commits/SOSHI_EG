import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { t } from '../../utils/i18n';

const items = [
  { to: '/', icon: Home, key: 'nav.home' },
  { to: '/orders', icon: ClipboardList, key: 'nav.orders' },
  { to: '/cart', icon: ShoppingBag, key: 'nav.cart' },
  { to: '/chat', icon: MessageSquare, key: 'nav.chat' },
  { to: '/profile', icon: User, key: 'nav.profile' },
];

export default function BottomNav() {
  const { lang } = useLanguage();
  const { type } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  if (type !== 'customer') return null;
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-black/95 border-t border-white/10 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider ${
                active ? 'text-accent' : 'text-white/45'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {t(item.key, lang)}
              {item.to === '/cart' && count > 0 && (
                <span className="absolute top-1 end-4 w-4 h-4 bg-accent text-ink text-[10px] font-bold flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
