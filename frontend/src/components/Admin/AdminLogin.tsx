import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { staffDashboardPath } from '../../utils/staffRoles';
import type { UserRole } from '../../types';
import BrandMark from '../Shared/BrandMark';
import LogoHalo from '../Shared/LogoHalo';
import ThemeToggle from '../Shared/ThemeToggle';
import LanguageSwitcher from '../Shared/LanguageSwitcher';

export default function AdminLogin() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (id: string, pin: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginStaff({ identifier: id, password: pin });
      const role = (user as { role?: UserRole }).role || 'order_handler';
      navigate(staffDashboardPath(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(identifier.trim() || '1111', password.trim() || '1111');
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4 gap-3">
          <LanguageSwitcher />
          <ThemeToggle compact />
        </div>
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <LogoHalo>
              <BrandMark size="md" />
            </LogoHalo>
          </div>
          <p className="label-luxury mb-2">{t('admin.panel', lang)}</p>
          <div className="divider-gold" />
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
          <div>
            <label className="field-label">
              <User className="w-3 h-3" />{t('login.username', lang)}
            </label>
            <input
              type="text"
              className="input-field"
              dir="ltr"
              placeholder="1111"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">
              <Lock className="w-3 h-3" />{t('login.password', lang)}
            </label>
            <input
              type="password"
              className="input-field"
              dir="ltr"
              placeholder="1111"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
            {loading ? '...' : t('btn.login', lang)}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => submit('1111', '1111')}
            className="btn-luxury w-full text-xs"
          >
            {t('login.demo_btn', lang)}
          </button>
          <div className="text-muted text-xs leading-relaxed space-y-1 border-t border-[var(--app-line)] pt-4">
            <p>{t('admin.demo_hint', lang)}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
