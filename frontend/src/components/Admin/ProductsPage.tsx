import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { Product } from '../../types';

const emptyForm = {
  name_ar: '', name_en: '', name_ru: '',
  description_ar: '', description_en: '', description_ru: '',
  price: '', category: 'nigiri', is_available: true, sort_order: 0,
};

export default function ProductsPage() {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getAllProducts()
      .then((r) => setProducts(r.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name_ar: p.name_ar, name_en: p.name_en, name_ru: p.name_ru,
      description_ar: p.description_ar || '', description_en: p.description_en || '', description_ru: p.description_ru || '',
      price: String(p.price), category: p.category,
      is_available: p.is_available, sort_order: p.sort_order || 0,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      sort_order: Number(form.sort_order),
    };
    try {
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    load();
  };

  const toggleAvailable = async (p: Product) => {
    await api.updateProduct(p.id, { is_available: !p.is_available });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-luxury mb-1">Management</p>
          <h1 className="font-display text-3xl text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-accent" />
            {t('admin.products', lang)}
          </h1>
        </div>
        <button onClick={openCreate} className="btn-luxury text-xs">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-display text-xl text-white mb-6">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['name_ar', 'name_en', 'name_ru'] as const).map((f) => (
              <div key={f}>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{f.replace('name_', '')}</label>
                <input className="input-field" required value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
            {(['description_ar', 'description_en', 'description_ru'] as const).map((f) => (
              <div key={f}>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{f.replace('description_', '')} desc</label>
                <input className="input-field" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Price (EGP)</label>
              <input className="input-field" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="nigiri">Nigiri</option>
                <option value="rolls">Rolls</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Sort Order</label>
              <input className="input-field" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="avail" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              <label htmlFor="avail" className="text-white/70 text-sm">Available</label>
            </div>
            {error && <p className="text-danger text-sm col-span-full">{error}</p>}
            <div className="col-span-full flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="btn-luxury-filled text-xs">{saving ? '...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-luxury text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-start p-4">Name (AR)</th>
                <th className="text-start p-4">Category</th>
                <th className="text-start p-4">Price</th>
                <th className="text-start p-4">Status</th>
                <th className="text-start p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white">{p.name_ar}</td>
                  <td className="p-4 text-white/50 capitalize">{p.category}</td>
                  <td className="p-4 text-accent font-display text-lg">{p.price} EGP</td>
                  <td className="p-4">
                    <button onClick={() => toggleAvailable(p)}
                      className={`text-xs px-3 py-1 border ${p.is_available ? 'border-success/50 text-success' : 'border-white/20 text-white/40'}`}>
                      {p.is_available ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-accent hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-danger/70 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
