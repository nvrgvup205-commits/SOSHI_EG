import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, Settings, UserCog, LogOut, Menu,
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
    <div className="min-h-screen bg-cream flex">
      <aside className={`fixed inset-y-0 start-0 z-40 w-64 bg-white border-e border-gray-100 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b">
          <div className="font-heading font-bold text-secondary text-lg">🍣 Admin</div>
          <div className="text-xs text-gray-400 mt-1">Sushi Shop Egypt</div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                {t(item.labelKey, lang)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="text-sm text-gray-600 mb-2">{(user as { full_name?: string })?.full_name}</div>
          <button onClick={logout} className="sidebar-link w-full text-danger">
            <LogOut className="w-5 h-5" />
            {t('nav.logout', lang)}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-heading font-bold text-secondary">Admin</span>
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
