import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { formatPhone, isValidEmail, isValidPhone } from '../../utils/validators';
import BrandMark from '../Shared/BrandMark';
import LogoHalo from '../Shared/LogoHalo';
import ThemeToggle from '../Shared/ThemeToggle';
import LanguageSwitcher from '../Shared/LanguageSwitcher';
import PwaInstallButton from '../Shared/PwaInstallButton';

export default function CustomerLogin() {
  const { loginCustomer, registerCustomer, type } = useAuth();
  const { lang, hasChosen } = useLanguage();
  const location = useLocation();
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

  if (!hasChosen) return <Navigate to="/" replace state={{ from: location.pathname }} />;
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
    <div className="splash-screen h-dvh max-h-dvh overflow-hidden flex flex-col px-6 pt-4 pb-4">
      <div className="ambient-glow fixed inset-0 pointer-events-none" />
      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-md mx-auto gap-2">
        <div className="flex items-center justify-between shrink-0" dir="ltr">
          <ThemeToggle compact />
          <LanguageSwitcher dark />
        </div>

        <div className="text-center shrink-0">
          <LogoHalo className="mx-auto mb-1">
            <BrandMark size="sm" />
          </LogoHalo>
          <p className="label-luxury text-[10px] mb-0.5">
            {mode === 'login' ? t('login.title', lang) : t('login.register_title', lang)}
          </p>
          <p className="text-muted text-[11px] leading-tight">{t('login.subtitle', lang)}</p>
        </div>

        <div className="auth-tabs shrink-0">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`auth-tab auth-tab-compact ${mode === 'login' ? 'is-active' : ''}`}
          >
            {t('login.have_account', lang)}
            {mode === 'login' && <motion.span layoutId="auth-tab" className="auth-tab-line" />}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`auth-tab auth-tab-compact ${mode === 'register' ? 'is-active' : ''}`}
          >
            {t('login.need_account', lang)}
            {mode === 'register' && <motion.span layoutId="auth-tab" className="auth-tab-line" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass-card auth-form-card p-3 flex flex-col gap-2 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {mode === 'register' && (
                <>
                  <div>
                    <label className="field-label field-label-compact"><User className="w-3 h-3" />{t('login.name', lang)} *</label>
                    <input className="input-field input-field-compact" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="field-label field-label-compact"><MapPin className="w-3 h-3" />{t('login.area', lang)}</label>
                      <input className="input-field input-field-compact" value={area} onChange={(e) => setArea(e.target.value)} />
                    </div>
                    <div>
                      <label className="field-label field-label-compact"><Phone className="w-3 h-3" />{t('login.phone', lang)} *</label>
                      <input className="input-field input-field-compact" type="tel" required dir="ltr" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="field-label field-label-compact"><MapPin className="w-3 h-3" />{t('login.address', lang)} *</label>
                    <input className="input-field input-field-compact" required value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label field-label-compact"><Mail className="w-3 h-3" />{t('login.email_optional', lang)}</label>
                    <input className="input-field input-field-compact" type="email" dir="ltr" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </>
              )}
              {mode === 'login' && (
                <>
                  <div>
                    <label className="field-label field-label-compact"><User className="w-3 h-3" />{t('login.username', lang)}</label>
                    <input className="input-field input-field-compact" dir="ltr" placeholder="1111" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label field-label-compact"><Lock className="w-3 h-3" />{t('login.password', lang)}</label>
                    <input className="input-field input-field-compact" type="password" dir="ltr" placeholder="1111" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-danger text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="btn-luxury-filled w-full !py-2 !text-xs">
            {loading ? '...' : mode === 'login' ? t('btn.login', lang) : t('btn.register', lang)}
          </button>

          {mode === 'login' && (
            <>
              <button type="button" onClick={runDemo} disabled={loading} className="btn-luxury w-full !py-1.5 !text-[10px]">
                {t('login.demo_btn', lang)}
              </button>
              <p className="text-muted text-[10px] leading-snug">{t('login.demo_hint', lang)}</p>
            </>
          )}
        </form>

        <div className="mt-auto shrink-0">
          <PwaInstallButton variant="inline" />
        </div>
      </div>
    </div>
  );
}
