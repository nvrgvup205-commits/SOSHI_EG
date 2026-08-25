import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import type { Order, OrderStatus } from '../types';
import AdminLogin from '../components/Admin/AdminLogin';

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
    <div className="min-h-screen bg-cream">
      <div className="bg-secondary text-white p-4">
        <h1 className="text-xl font-heading font-bold">🍣 {t('nav.staff', lang)}</h1>
        <p className="text-white/60 text-sm">{(user as { full_name?: string })?.full_name}</p>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-lg font-semibold text-secondary mb-4">{t('staff.orders', lang)}</h2>
        {orders.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">No orders</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-secondary">#{order.order_number}</div>
                    <div className="text-sm text-gray-500">{order.customer_name} - {order.customer_phone}</div>
                  </div>
                  <div className="text-primary font-bold">{order.total_price} {t('currency', lang)}</div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.id, s)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        order.status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
