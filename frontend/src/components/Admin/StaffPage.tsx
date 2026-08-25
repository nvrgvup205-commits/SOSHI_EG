import { useEffect, useState } from 'react';
import { Plus, UserCog, Phone, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { ROLE_LABELS, STAFF_ROLES } from '../../utils/staffRoles';
import type { StaffUser } from '../../types';

export default function StaffPage() {
  const { lang } = useLanguage();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'order_handler' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    try {
      const res = await api.createStaff({ ...form, password: '1234' });
      setShowForm(false);
      setForm({ full_name: '', phone: '', role: 'order_handler' });
      setSuccess(`${t('staff.created', lang)} — ${t('login.password', lang)}: ${res.default_password || '1234'}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: StaffUser) => {
    await api.updateStaff(s.id, { is_active: !s.is_active });
    load();
  };

  const roleLabel = (role: string) => ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.[lang === 'ar' ? 'ar' : 'en'] || role;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="label-luxury mb-1">Management</p>
          <h1 className="font-display text-2xl sm:text-3xl text-white flex items-center gap-3">
            <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
            {t('admin.staff', lang)}
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-luxury text-xs w-full sm:w-auto">
          <Plus className="w-4 h-4" /> {t('staff.add', lang)}
        </button>
      </div>

      {success && <div className="card p-4 mb-4 border border-success/30 text-success text-sm">{success}</div>}

      {showForm && (
        <div className="card p-4 sm:p-6 mb-6">
          <h2 className="font-display text-xl text-white mb-4">{t('staff.add', lang)}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{t('customers.name', lang)}</label>
              <input className="input-field" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{t('customers.phone', lang)}</label>
              <input className="input-field" type="tel" required dir="ltr" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{t('staff.role', lang)}</label>
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
            </div>
            <p className="text-white/40 text-xs">{t('staff.default_password', lang)}: <span className="text-accent font-mono">1234</span></p>
            {error && <p className="text-danger text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-luxury-filled text-xs flex-1 sm:flex-none">{saving ? '...' : t('btn.submit', lang)}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-luxury text-xs">{t('btn.cancel', lang)}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : staff.length === 0 ? (
        <div className="card p-12 text-center text-white/30">{t('staff.empty', lang)}</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {staff.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-medium">{s.full_name}</div>
                    <div className="flex items-center gap-1 text-white/50 text-sm mt-1" dir="ltr">
                      <Phone className="w-3 h-3 shrink-0" />{s.phone || '—'}
                    </div>
                    <span className="inline-block mt-2 text-xs px-2 py-1 border border-accent/30 text-accent">{roleLabel(s.role)}</span>
                  </div>
                  <button onClick={() => toggleActive(s)} className="shrink-0 p-1">
                    {s.is_active
                      ? <ToggleRight className="w-8 h-8 text-success" />
                      : <ToggleLeft className="w-8 h-8 text-white/30" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card overflow-hidden hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-start p-4">{t('customers.name', lang)}</th>
                  <th className="text-start p-4">{t('customers.phone', lang)}</th>
                  <th className="text-start p-4">{t('staff.role', lang)}</th>
                  <th className="text-start p-4">{t('customers.status', lang)}</th>
                  <th className="text-start p-4">{t('staff.actions', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white">{s.full_name}</td>
                    <td className="p-4 text-white/50" dir="ltr">{s.phone || '—'}</td>
                    <td className="p-4"><span className="text-xs px-2 py-1 border border-accent/30 text-accent">{roleLabel(s.role)}</span></td>
                    <td className="p-4">
                      <span className={`text-xs ${s.is_active ? 'text-success' : 'text-white/30'}`}>
                        {s.is_active ? t('customers.active', lang) : t('customers.inactive', lang)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleActive(s)} className="text-xs btn-luxury py-1.5 px-3">
                        {s.is_active ? t('staff.deactivate', lang) : t('staff.activate', lang)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
