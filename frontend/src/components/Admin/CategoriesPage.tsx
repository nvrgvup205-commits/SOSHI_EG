import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Category } from '../../types';

export default function CategoriesPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ slug: '', name_ar: '', name_en: '', name_ru: '', sort_order: 0 });

  const load = () => api.getCategories().then((r) => setItems(r.categories)).catch(console.error);
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createCategory(form);
    setForm({ slug: '', name_ar: '', name_en: '', name_ru: '', sort_order: 0 });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-white mb-6">{t('admin.categories', lang)}</h1>
      <form onSubmit={save} className="card p-5 grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {(['slug', 'name_ar', 'name_en', 'name_ru'] as const).map((k) => (
          <input key={k} className="input-field" placeholder={k} required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <button className="btn-luxury-filled text-xs">{t('btn.save', lang)}</button>
      </form>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="card p-4 flex justify-between items-center">
            <span className="text-white">{c.name_ar} / {c.name_en} / {c.name_ru}</span>
            <button className="text-danger text-sm" onClick={async () => { await api.deleteCategory(c.id); load(); }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
