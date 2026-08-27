import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, MessageSquare, LogOut, Download, User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import {
  staffCanAccessChat,
  staffCanAccessOrders,
  staffCanAccessProducts,
  isAdminRole,
  staffDashboardPath,
} from '../utils/staffRoles';
import type { Order, OrderStatus, Product, UserRole } from '../types';
import { pickProductThumbnail } from '../utils/productImage';
import AdminLogin from '../components/Admin/AdminLogin';
import BrandName from '../components/Shared/BrandName';
import LanguageSwitcher from '../components/Shared/LanguageSwitcher';
import ChatInbox from '../components/Admin/ChatInbox';

const statuses: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered'];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export default function StaffPortal() {
  const { type, user, logout } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<'orders' | 'products' | 'chat'>('orders');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const role = (user as { role?: UserRole })?.role || 'order_handler';
  const showOrders = staffCanAccessOrders(role);
  const showProducts = staffCanAccessProducts(role);
  const showChat = staffCanAccessChat(role);

  useEffect(() => {
    if (type === 'staff' && isAdminRole(role)) {
      navigate(staffDashboardPath(role), { replace: true });
    }
  }, [type, role, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (type !== 'staff') return;
    if (showOrders) api.getOrders().then((r) => setOrders(r.orders)).catch(console.error);
    if (showProducts) api.getProducts().then((r) => setProducts(r.products)).catch(console.error);
  }, [type, showOrders, showProducts]);

  useEffect(() => {
    if (showOrders) setTab('orders');
    else if (showProducts) setTab('products');
    else if (showChat) setTab('chat');
  }, [showOrders, showProducts, showChat]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const installPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  if (type !== 'staff') return <AdminLogin />;

  const tabs = [
    showOrders && { id: 'orders' as const, icon: ShoppingBag, label: t('staff.orders', lang) },
    showProducts && { id: 'products' as const, icon: Package, label: t('admin.products', lang) },
    showChat && { id: 'chat' as const, icon: MessageSquare, label: t('staff.chat', lang) },
  ].filter(Boolean) as Array<{ id: 'orders' | 'products' | 'chat'; icon: typeof ShoppingBag; label: string }>;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 bg-charcoal border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandName size="sm" />
            <div className="min-w-0">
              <p className="label-luxury text-[10px] mb-0.5">{t('nav.staff', lang)}</p>
              <p className="text-white text-sm truncate flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-accent shrink-0" />
                {(user as { full_name?: string })?.full_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher onDark />
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

        {tabs.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap border transition-all ${
                  tab === id ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 pb-8">
        {tab === 'orders' && showOrders && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="card p-12 text-center text-white/30">{t('staff.no_orders', lang)}</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card p-4">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-display text-lg text-white">#{order.order_number}</div>
                      <div className="text-sm text-white/40 mt-1 truncate">{order.customer_name} — {order.customer_phone}</div>
                    </div>
                    <div className="text-accent font-display text-lg shrink-0">{order.total_price} {t('currency', lang)}</div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-all ${
                          order.status === s
                            ? 'border-accent text-accent bg-accent/10'
                            : 'border-white/10 text-white/40'
                        }`}
                      >
                        {t(`status.${s}`, lang)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'products' && showProducts && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="card p-12 text-center text-white/30">{t('staff.no_products', lang)}</div>
            ) : (
              products.map((p) => (
                <div key={p.id} className="card p-4 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {pickProductThumbnail(p) ? (
                      <img src={pickProductThumbnail(p)!} alt="" className="h-12 w-12 rounded object-cover shrink-0" />
                    ) : null}
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{lang === 'ar' ? p.name_ar : p.name_en}</div>
                      <div className="text-white/40 text-xs capitalize mt-0.5">{p.category}</div>
                    </div>
                  </div>
                  <div className="text-accent font-display shrink-0">{p.price} {t('currency', lang)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'chat' && showChat && <ChatInbox />}
      </main>
    </div>
  );
}
