import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Order, OrderStatus } from '../../types';
import { formatDate } from '../../utils/validators';

const statuses: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getOrders().then((r) => setOrders(r.orders)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <p className="label-luxury mb-1">Management</p>
        <h1 className="font-display text-2xl sm:text-3xl text-white flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          {t('admin.orders', lang)}
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-white/30">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="text-accent font-display text-xl">#{order.order_number}</div>
                  <div className="text-white/50 text-sm mt-1">{order.customer_name} · {order.customer_phone}</div>
                  <div className="text-white/30 text-xs mt-1">{formatDate(order.created_at, lang)}</div>
                </div>
                <div className="text-2xl font-display text-white">{order.total_price} {t('currency', lang)}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {statuses.map((s) => (
                  <button key={s} onClick={() => updateStatus(order.id, s)}
                    className={`px-3 py-1 text-xs uppercase tracking-wider border transition-all ${
                      order.status === s ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}>
                    {t(`status.${s}`, lang)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
