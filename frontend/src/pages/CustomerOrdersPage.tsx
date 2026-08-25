import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import { api } from '../utils/api';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/i18n';
import { formatDate } from '../utils/validators';
import type { Order } from '../types';

export default function CustomerOrdersPage() {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders().then((r) => setOrders(r.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <h1 className="font-display text-4xl text-white mb-8">{t('orders.title', lang)}</h1>
        {loading ? (
          <p className="text-white/30">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-white/40">{t('orders.empty', lang)}</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 block hover:border-accent/40">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="text-accent font-display text-xl">#{order.order_number}</div>
                    <div className="text-white/40 text-sm mt-1">{formatDate(order.created_at, lang)}</div>
                    <div className="text-xs uppercase tracking-wider text-white/50 mt-2">{t(`status.${order.status}`, lang)}</div>
                  </div>
                  <div className="text-white font-display text-2xl">{order.total_price} {t('currency', lang)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
