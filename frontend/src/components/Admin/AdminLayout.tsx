import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, Settings, UserCog, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard', exact: true },
  { path: '/admin/customers', icon: Users, labelKey: 'admin.customers' },
  { path: '/admin/products', icon: Package, labelKey: 'admin.products' },
  { path: '/admin/orders', icon: ShoppingBag, labelKey: 'admin.orders' },
  { path: '/admin/staff', icon: UserCog, labelKey: 'admin.staff' },
  { path: '/admin/settings', icon: Settings, labelKey: 'admin.settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink flex">
      <aside className={`fixed inset-y-0 start-0 z-40 w-64 bg-charcoal border-e border-white/5 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5">
          <div className="text-xs tracking-[0.3em] uppercase text-accent">Admin</div>
          <div className="font-display text-xl text-white mt-1">Sushi Shop</div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${active ? 'active' : ''}`}>
                <item.icon className="w-4 h-4" />
                {t(item.labelKey, lang)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <div className="text-sm text-white/50 mb-3">{(user as { full_name?: string })?.full_name}</div>
          <button onClick={logout} className="sidebar-link w-full text-danger/80 hover:text-danger">
            <LogOut className="w-4 h-4" />
            {t('nav.logout', lang)}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 bg-charcoal border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6 text-white" /></button>
          <span className="font-display text-white">Admin</span>
          <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-white opacity-0" /></button>
        </div>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
