import { useEffect, useState } from 'react';
import { Plus, UserCog } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import type { StaffUser } from '../../types';

const roles = ['admin', 'staff_supervisor', 'order_handler', 'chat_handler', 'product_viewer'] as const;

export default function StaffPage() {
  const { lang } = useLanguage();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', role: 'order_handler', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getStaff().then((r) => setStaff(r.staff)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createStaff(form);
      setShowForm(false);
      setForm({ email: '', full_name: '', phone: '', role: 'order_handler', password: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-luxury mb-1">Management</p>
          <h1 className="font-display text-3xl text-white flex items-center gap-3">
            <UserCog className="w-7 h-7 text-accent" />
            {t('admin.staff', lang)}
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-luxury text-xs">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-display text-xl text-white mb-6">New Staff Member</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Full Name</label>
              <input className="input-field" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Email</label>
              <input className="input-field" type="email" required dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Phone</label>
              <input className="input-field" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Role</label>
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Password</label>
              <input className="input-field" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <p className="text-danger text-sm col-span-full">{error}</p>}
            <div className="col-span-full flex gap-3">
              <button type="submit" disabled={saving} className="btn-luxury-filled text-xs">{saving ? '...' : 'Create'}</button>
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
                <th className="text-start p-4">Name</th>
                <th className="text-start p-4">Email</th>
                <th className="text-start p-4">Role</th>
                <th className="text-start p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-white">{s.full_name}</td>
                  <td className="p-4 text-white/50" dir="ltr">{s.email}</td>
                  <td className="p-4"><span className="text-xs px-2 py-1 border border-accent/30 text-accent">{s.role}</span></td>
                  <td className="p-4">
                    <span className={`text-xs ${s.is_active ? 'text-success' : 'text-white/30'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
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
