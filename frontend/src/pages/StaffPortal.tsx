import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import type { Order, OrderStatus } from '../types';
import AdminLogin from '../components/Admin/AdminLogin';
import AnimatedLogo from '../components/Shared/AnimatedLogo';

const statuses: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered'];

export default function StaffPortal() {
  const { type, user } = useAuth();
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (type === 'staff') {
      api.getOrders().then((res) => setOrders(res.orders)).catch(console.error);
    }
  }, [type]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (type !== 'staff') return <AdminLogin />;

  return (
    <div className="min-h-screen bg-ink">
      <div className="bg-charcoal border-b border-white/5 p-6 flex items-center gap-4">
        <AnimatedLogo size="sm" />
        <div>
          <p className="label-luxury mb-1">Staff Portal</p>
          <h1 className="font-display text-xl text-white">{t('nav.staff', lang)}</h1>
          <p className="text-white/40 text-sm mt-1">{(user as { full_name?: string })?.full_name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="font-display text-xl text-white mb-6">{t('staff.orders', lang)}</h2>
        {orders.length === 0 ? (
          <div className="card p-12 text-center text-white/30">No orders</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-display text-xl text-white">#{order.order_number}</div>
                    <div className="text-sm text-white/40 mt-1">{order.customer_name} — {order.customer_phone}</div>
                  </div>
                  <div className="text-accent font-display text-xl">{order.total_price} {t('currency', lang)}</div>
                </div>
                <div className="flex gap-2 flex-wrap mt-4">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.id, s)}
                      className={`px-4 py-1.5 text-xs uppercase tracking-wider border transition-all ${
                        order.status === s
                          ? 'border-accent text-accent bg-accent/10'
                          : 'border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      {t(`status.${s}`, lang)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
