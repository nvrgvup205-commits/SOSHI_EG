import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, Settings, UserCog, LogOut, ChevronDown, Download,
  Layers, Megaphone, MapPin, TicketPercent, BarChart3, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import SiteLogo from '../Shared/SiteLogo';
import type { UserRole } from '../../types';

const allNavItems = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard', exact: true, roles: ['admin', 'staff_supervisor'] as UserRole[] },
  { path: '/admin/orders', icon: ShoppingBag, labelKey: 'admin.orders', roles: ['admin', 'staff_supervisor', 'order_handler'] as UserRole[] },
  { path: '/admin/customers', icon: Users, labelKey: 'admin.customers', roles: ['admin', 'staff_supervisor'] as UserRole[] },
  { path: '/admin/products', icon: Package, labelKey: 'admin.products', roles: ['admin', 'staff_supervisor', 'product_viewer'] as UserRole[] },
  { path: '/admin/categories', icon: Layers, labelKey: 'admin.categories', roles: ['admin', 'staff_supervisor'] as UserRole[] },
  { path: '/admin/banners', icon: Megaphone, labelKey: 'admin.banners', roles: ['admin'] as UserRole[] },
  { path: '/admin/zones', icon: MapPin, labelKey: 'admin.zones', roles: ['admin'] as UserRole[] },
  { path: '/admin/coupons', icon: TicketPercent, labelKey: 'admin.coupons', roles: ['admin'] as UserRole[] },
  { path: '/admin/chat', icon: MessageSquare, labelKey: 'admin.chat', roles: ['admin', 'staff_supervisor', 'chat_handler'] as UserRole[] },
  { path: '/admin/reports', icon: BarChart3, labelKey: 'admin.reports', roles: ['admin', 'staff_supervisor'] as UserRole[] },
  { path: '/admin/staff', icon: UserCog, labelKey: 'admin.staff', roles: ['admin'] as UserRole[] },
  { path: '/admin/settings', icon: Settings, labelKey: 'admin.settings', roles: ['admin'] as UserRole[] },
];

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = (user as { role?: UserRole })?.role || 'admin';
  const navItems = allNavItems.filter((item) => item.roles.includes(role));
  const activeItem = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path),
  ) || navItems[0];

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleNavSelect = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const installPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen app-shell flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-black border-e border-white/5">
        <div className="p-6 border-b border-white/5">
          <SiteLogo to="/admin" size="sm" />
          <div className="text-xs tracking-[0.3em] uppercase text-accent/60 mt-2">{t('admin.panel', lang)}</div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`sidebar-link ${active ? 'active' : ''}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {t(item.labelKey, lang)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="text-sm text-white/50 mb-3 truncate">{(user as { full_name?: string })?.full_name}</div>
          <button onClick={logout} className="sidebar-link w-full text-danger/80 hover:text-danger">
            <LogOut className="w-4 h-4" />
            {t('nav.logout', lang)}
          </button>
        </div>
      </aside>

      {/* Mobile + desktop content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:min-h-0">
        {/* Mobile header with dropdown */}
        <header className="lg:hidden sticky top-0 z-50 bg-charcoal border-b border-white/5 safe-area-top">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <SiteLogo to="/admin" size="sm" />
            <div className="flex items-center gap-2">
              {!isStandalone() && deferredPrompt && (
                <button onClick={installPwa} className="p-2 text-accent" aria-label="Install">
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button onClick={logout} className="p-2 text-white/50 hover:text-danger">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-3 relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 px-4 py-3 text-white"
            >
              <span className="flex items-center gap-3 min-w-0">
                {activeItem && <activeItem.icon className="w-5 h-5 text-accent shrink-0" />}
                <span className="font-medium truncate">{activeItem ? t(activeItem.labelKey, lang) : t('admin.dashboard', lang)}</span>
              </span>
              <ChevronDown className={`w-5 h-5 text-white/50 shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute inset-x-4 z-50 mt-1 bg-charcoal border border-white/10 shadow-2xl max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => {
                  const active = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavSelect(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-start transition-colors ${
                        active ? 'bg-accent/10 text-accent border-s-2 border-accent' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span>{t(item.labelKey, lang)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 pb-2 text-xs text-white/40 truncate">
            {(user as { full_name?: string })?.full_name}
          </div>
        </header>

        {/* Full-screen content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
