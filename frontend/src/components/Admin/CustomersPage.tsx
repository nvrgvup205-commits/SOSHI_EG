import { useEffect, useState } from 'react';
import { Search, Users, Mail, Phone, ShoppingBag, Clock } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { formatDate } from '../../utils/validators';
import type { Customer } from '../../types';

export default function CustomersPage() {
  const { lang } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadCustomers = async (q?: string) => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ search: q });
      setCustomers(res.customers);
      setTotal(res.pagination.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(search);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-luxury mb-1">Database</p>
          <h1 className="font-display text-3xl text-fg flex items-center gap-3">
            <Users className="w-7 h-7 text-accent" />
            {t('admin.customers', lang)}
          </h1>
          <p className="text-muted text-sm mt-2">{total} {t('admin.total_customers', lang)}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            className="input-field ps-10"
            placeholder={t('customers.search', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-luxury text-xs">{t('btn.submit', lang)}</button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="card p-16 text-center text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No customers yet</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {customers.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="text-fg font-medium mb-2">{c.full_name || '—'}</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted" dir="ltr">
                    <Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted" dir="ltr">
                    <Phone className="w-3.5 h-3.5 shrink-0" />{c.phone}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-accent" />{c.total_orders}</span>
                    <span className="text-accent font-display">{Number(c.total_spent).toFixed(0)} {t('currency', lang)}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 border ${c.is_active ? 'border-success/50 text-success' : 'border-white/20 text-muted'}`}>
                    {c.is_active ? t('customers.active', lang) : t('customers.inactive', lang)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted text-xs uppercase tracking-wider">
                  <th className="text-start p-4">{t('customers.name', lang)}</th>
                  <th className="text-start p-4">{t('customers.email', lang)}</th>
                  <th className="text-start p-4">{t('customers.phone', lang)}</th>
                  <th className="text-start p-4">{t('customers.orders', lang)}</th>
                  <th className="text-start p-4">{t('customers.spent', lang)}</th>
                  <th className="text-start p-4">{t('customers.last_login', lang)}</th>
                  <th className="text-start p-4">{t('customers.status', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-fg font-medium">{c.full_name || '-'}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-muted" dir="ltr">
                        <Mail className="w-3 h-3" />{c.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-muted" dir="ltr">
                        <Phone className="w-3 h-3" />{c.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-fg/70">
                        <ShoppingBag className="w-3 h-3 text-accent" />{c.total_orders}
                      </span>
                    </td>
                    <td className="p-4 font-display text-lg text-accent">
                      {Number(c.total_spent).toFixed(0)} {t('currency', lang)}
                    </td>
                    <td className="p-4 text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(c.last_login_at, lang)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 border ${c.is_active ? 'border-success/50 text-success' : 'border-white/20 text-muted'}`}>
                        {c.is_active ? t('customers.active', lang) : t('customers.inactive', lang)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
