import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Order } from '../../types';

export default function TrackOrderButton() {
  const { type } = useAuth();
  const { lang } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (type !== 'customer') return;
    api.getMyOrders()
      .then((r) => {
        const active = r.orders.find((o) => o.status !== 'delivered' && o.status !== 'cancelled');
        setOrder(active || null);
      })
      .catch(() => {});
  }, [type]);

  if (type !== 'customer') {
    return (
      <Link to="/login" className="track-order-btn text-xs">
        <MapPin className="w-3.5 h-3.5" />
        {t('track.title', lang)}
      </Link>
    );
  }

  if (!order) {
    return (
      <Link to="/orders" className="track-order-btn text-xs opacity-70">
        <MapPin className="w-3.5 h-3.5" />
        {t('track.title', lang)}
      </Link>
    );
  }

  return (
    <Link to={`/orders/${order.id}`} className="track-order-btn text-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="truncate max-w-[8rem]">#{order.order_number}</span>
      <span className="text-accent/80">{t(`status.${order.status}`, lang)}</span>
    </Link>
  );
}
