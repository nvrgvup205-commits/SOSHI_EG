import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Coupon } from '../../types';

export default function CouponsPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('10');
  const [type, setType] = useState('percent');

  const load = () => api.getCoupons().then((r) => setItems(r.coupons)).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-fg mb-6">{t('admin.coupons', lang)}</h1>
      <form
        className="card p-5 grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.createCoupon({ code, discount: Number(discount), type });
          setCode('');
          load();
        }}
      >
        <input className="input-field" placeholder="CODE" dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input className="input-field" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="percent">percent</option>
          <option value="fixed">fixed</option>
        </select>
        <button className="btn-luxury-filled text-xs">{t('btn.save', lang)}</button>
      </form>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="card p-4 flex justify-between text-fg">
            <span>{c.code} — {c.discount}{c.type === 'percent' ? '%' : ` ${t('currency', lang)}`}</span>
            <button className="text-danger text-sm" onClick={async () => { await api.deleteCoupon(c.id); load(); }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
