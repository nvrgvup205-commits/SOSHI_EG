import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { DeliveryZone } from '../../types';

export default function ZonesPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<DeliveryZone[]>([]);
  const [name, setName] = useState('');
  const [fee, setFee] = useState('40');

  const load = () => api.getZones(true).then((r) => setItems(r.zones)).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-fg mb-6">{t('admin.zones', lang)}</h1>
      <form
        className="card p-5 flex flex-col md:flex-row gap-3 mb-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.createZone({ name, delivery_fee: Number(fee) });
          setName('');
          load();
        }}
      >
        <input className="input-field" placeholder="Zone name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input-field" type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
        <button className="btn-luxury-filled text-xs">{t('btn.save', lang)}</button>
      </form>
      <div className="space-y-2">
        {items.map((z) => (
          <div key={z.id} className="card p-4 flex justify-between text-fg">
            <span>{z.name}</span>
            <span className="text-accent">{z.delivery_fee} {t('currency', lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
