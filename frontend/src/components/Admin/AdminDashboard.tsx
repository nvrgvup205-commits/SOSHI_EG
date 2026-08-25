import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Users, MessageSquare, UserCheck } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [stats, setStats] = useState({
    today_orders: 0,
    total_customers: 0,
    today_messages: 0,
    active_staff: 0,
  });

  useEffect(() => {
    api.getAnalytics().then(setStats).catch(console.error);
  }, []);

  const cards = [
    { icon: ShoppingBag, label: t('admin.today_orders', lang), value: stats.today_orders, color: 'text-primary' },
    { icon: Users, label: t('admin.total_customers', lang), value: stats.total_customers, color: 'text-secondary' },
    { icon: MessageSquare, label: t('admin.today_messages', lang), value: stats.today_messages, color: 'text-accent' },
    { icon: UserCheck, label: t('admin.active_staff', lang), value: stats.active_staff, color: 'text-success' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-secondary flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7" />
          {t('admin.dashboard', lang)}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('admin.welcome', lang)}, {(user as { full_name?: string })?.full_name} 👋
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card p-6 animate-slide-up">
            <card.icon className={`w-8 h-8 ${card.color} mb-3`} />
            <div className="text-3xl font-bold text-secondary">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
