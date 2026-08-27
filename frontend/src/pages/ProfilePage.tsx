import { useEffect, useState } from 'react';
import CustomerShell from '../components/Shared/CustomerShell';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/i18n';
import { api } from '../utils/api';
import type { Address, Customer } from '../types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const customer = user as Customer;
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    api.getAddresses().then((r) => setAddresses(r.addresses)).catch(console.error);
  }, []);

  return (
    <CustomerShell>
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24 space-y-6">
        <h1 className="font-display text-4xl text-fg">{t('profile.title', lang)}</h1>
        <div className="card p-6 space-y-2 text-muted">
          <p>{customer?.full_name}</p>
          <p dir="ltr">{customer?.email}</p>
          <p dir="ltr">{customer?.phone}</p>
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="font-display text-xl text-fg">{t('checkout.address', lang)}</h2>
          {addresses.map((a) => (
            <p key={a.id} className="text-muted">{a.area ? `${a.area} — ` : ''}{a.address}</p>
          ))}
        </div>
        <button type="button" onClick={logout} className="btn-luxury w-full">{t('nav.logout', lang)}</button>
      </div>
    </CustomerShell>
  );
}
