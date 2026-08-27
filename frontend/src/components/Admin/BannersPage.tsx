import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Banner } from '../../types';

export default function BannersPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState({
    kind: 'new_rolls', title_ar: '', title_en: '', title_ru: '', subtitle_ar: '', subtitle_en: '', subtitle_ru: '', image_url: '',
  });

  const load = () => api.getBanners(true).then((r) => setItems(r.banners)).catch(console.error);
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createBanner(form);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-fg mb-6">{t('admin.banners', lang)}</h1>
      <form onSubmit={save} className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <select className="input-field" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="new_rolls">new_rolls</option>
          <option value="offers">offers</option>
          <option value="popular">popular</option>
        </select>
        {(['title_ar', 'title_en', 'title_ru', 'subtitle_ar', 'subtitle_en', 'subtitle_ru', 'image_url'] as const).map((k) => (
          <input key={k} className="input-field" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <button className="btn-luxury-filled text-xs">{t('btn.save', lang)}</button>
      </form>
      <div className="space-y-2">
        {items.map((b) => (
          <div key={b.id} className="card p-4 flex justify-between">
            <span className="text-fg">{b.kind} — {b.title_ar}</span>
            <button className="text-danger text-sm" onClick={async () => { await api.deleteBanner(b.id); load(); }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
