import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { formatPhone, isValidEmail, isValidPhone } from '../../utils/validators';
import BrandMark from '../Shared/BrandMark';
import SushiStage from '../Shared/SushiStageLazy';
import ThemeToggle from '../Shared/ThemeToggle';
import LanguageSwitcher from '../Shared/LanguageSwitcher';

export default function CustomerLogin() {
  const { loginCustomer, registerCustomer, type } = useAuth();
  const { lang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (type === 'customer') return <Navigate to="/" replace />;

  const runDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await loginCustomer({ identifier: '1111', password: '1111', preferred_language: lang });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.loading', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = identifier.trim() || '1111';
        const pin = password.trim() || '1111';
        await loginCustomer({ identifier: user, password: pin, preferred_language: lang });
        return;
      }
      if (!fullName.trim() || !address.trim()) {
        setLoading(false);
        return setError(t('login.name', lang) + ' + ' + t('login.address', lang));
      }
      if (!isValidPhone(phone)) {
        setLoading(false);
        return setError(t('login.phone', lang));
      }
      if (email && !isValidEmail(email)) {
        setLoading(false);
        return setError(t('login.email', lang));
      }
      await registerCustomer({
        email: email.trim() || undefined,
        phone: formatPhone(phone),
        full_name: fullName.trim(),
        area: area.trim() || undefined,
        address: address.trim(),
        preferred_language: lang,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="splash-screen">
      <SushiStage />
      <div className="splash-veil" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <LanguageSwitcher dark />
            <ThemeToggle compact />
          </div>
          <div className="text-center mb-8">
            <div className="logo-plate mx-auto mb-5 w-max">
              <BrandMark size="lg" />
            </div>
            <p className="label-luxury mb-2">
              {mode === 'login' ? t('login.title', lang) : t('login.register_title', lang)}
            </p>
            <p className="text-muted text-sm">{t('login.subtitle', lang)}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs uppercase tracking-wider border ${mode === 'login' ? 'border-accent text-accent' : 'border-[var(--app-line)] text-muted'}`}
            >
              {t('login.have_account', lang)}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs uppercase tracking-wider border ${mode === 'register' ? 'border-accent text-accent' : 'border-[var(--app-line)] text-muted'}`}
            >
              {t('login.need_account', lang)}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="field-label"><User className="w-3 h-3" />{t('login.name', lang)} *</label>
                  <input className="input-field" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="field-label"><MapPin className="w-3 h-3" />{t('login.area', lang)}</label>
                  <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
                <div>
                  <label className="field-label"><MapPin className="w-3 h-3" />{t('login.address', lang)} *</label>
                  <textarea className="input-field min-h-20" required value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="field-label"><Phone className="w-3 h-3" />{t('login.phone', lang)} *</label>
                  <input className="input-field" type="tel" required dir="ltr" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="field-label"><Mail className="w-3 h-3" />{t('login.email_optional', lang)}</label>
                  <input className="input-field" type="email" dir="ltr" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </>
            )}
            {mode === 'login' && (
              <>
                <div>
                  <label className="field-label"><User className="w-3 h-3" />{t('login.username', lang)}</label>
                  <input className="input-field" dir="ltr" placeholder="1111" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                </div>
                <div>
                  <label className="field-label"><Lock className="w-3 h-3" />{t('login.password', lang)}</label>
                  <input className="input-field" type="password" dir="ltr" placeholder="1111" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </>
            )}
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
              {loading ? '...' : mode === 'login' ? t('btn.login', lang) : t('btn.register', lang)}
            </button>
            {mode === 'login' && (
              <button type="button" onClick={runDemo} disabled={loading} className="btn-luxury w-full text-xs">
                {t('login.demo_btn', lang)}
              </button>
            )}
            <p className="text-muted text-xs leading-relaxed">{t('login.demo_hint', lang)}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
