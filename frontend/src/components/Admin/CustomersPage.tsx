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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary flex items-center gap-2">
            <Users className="w-7 h-7" />
            {t('admin.customers', lang)}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} {t('admin.total_customers', lang)}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input-field ps-10"
            placeholder={t('customers.search', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">{t('btn.submit', lang)}</button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No customers yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream">
                <tr>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.name', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.email', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.phone', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.orders', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.spent', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.last_login', lang)}</th>
                  <th className="text-start p-4 font-semibold text-secondary">{t('customers.status', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-cream/50 transition-colors">
                    <td className="p-4 font-medium">{c.full_name || '-'}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-gray-600" dir="ltr">
                        <Mail className="w-3 h-3" />{c.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-gray-600" dir="ltr">
                        <Phone className="w-3 h-3" />{c.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-primary" />{c.total_orders}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-primary">{Number(c.total_spent).toFixed(0)} {t('currency', lang)}</td>
                    <td className="p-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(c.last_login_at, lang)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? t('customers.active', lang) : t('customers.inactive', lang)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
