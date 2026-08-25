import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Users, MessageSquare, UserCheck } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [stats, setStats] = useState({ today_orders: 0, total_customers: 0, today_messages: 0, active_staff: 0 });

  useEffect(() => { api.getAnalytics().then(setStats).catch(console.error); }, []);

  const cards = [
    { icon: ShoppingBag, label: t('admin.today_orders', lang), value: stats.today_orders },
    { icon: Users, label: t('admin.total_customers', lang), value: stats.total_customers },
    { icon: MessageSquare, label: t('admin.today_messages', lang), value: stats.today_messages },
    { icon: UserCheck, label: t('admin.active_staff', lang), value: stats.active_staff },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="label-luxury mb-1">Overview</p>
        <h1 className="font-display text-3xl text-white flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-accent" />
          {t('admin.dashboard', lang)}
        </h1>
        <p className="text-white/40 mt-2">{t('admin.welcome', lang)}, {(user as { full_name?: string })?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <card.icon className="w-6 h-6 text-accent mb-4" />
            <div className="font-display text-4xl text-white">{card.value}</div>
            <div className="text-white/40 text-xs uppercase tracking-wider mt-2">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
