import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

export default function ReportsPage() {
  const { lang } = useLanguage();
  const [report, setReport] = useState<{
    orders_count: number;
    revenue: number;
    cash_orders: number;
    by_status: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    api.getReports().then(setReport).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-white mb-6">{t('admin.reports', lang)}</h1>
      {!report ? (
        <p className="text-white/30">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5"><div className="text-white/40 text-xs">30-day orders</div><div className="font-display text-3xl text-white">{report.orders_count}</div></div>
          <div className="card p-5"><div className="text-white/40 text-xs">Revenue</div><div className="font-display text-3xl text-accent">{report.revenue} {t('currency', lang)}</div></div>
          <div className="card p-5"><div className="text-white/40 text-xs">Cash</div><div className="font-display text-3xl text-white">{report.cash_orders}</div></div>
          <div className="card p-5">
            <div className="text-white/40 text-xs mb-2">By status</div>
            {Object.entries(report.by_status).map(([k, v]) => (
              <div key={k} className="flex justify-between text-white/70 text-sm">
                <span>{t(`status.${k}`, lang)}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
