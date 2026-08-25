import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { staffDashboardPath } from '../../utils/staffRoles';
import type { UserRole } from '../../types';
import AnimatedLogo from '../Shared/AnimatedLogo';

export default function AdminLogin() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginStaff({ phone, password });
      const role = (user as { role?: UserRole }).role || 'order_handler';
      navigate(staffDashboardPath(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <AnimatedLogo size="md" animate />
          </div>
          <p className="label-luxury mb-2">{t('admin.panel', lang)}</p>
          <div className="divider-gold" />
        </div>
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Phone className="w-3 h-3" />{t('login.phone', lang)}
            </label>
            <input
              type="tel"
              required
              className="input-field"
              dir="ltr"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" />{t('login.password', lang)}
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
            {loading ? '...' : t('btn.login', lang)}
          </button>
          <p className="text-white/30 text-xs text-center">{t('admin.login_hint', lang)}</p>
        </form>
      </div>
    </div>
  );
}
