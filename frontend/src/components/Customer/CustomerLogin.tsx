import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Phone, User, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { isValidEmail, isValidPhone, formatPhone } from '../../utils/validators';
import Header from '../Shared/Header';
import AnimatedLogo from '../Shared/AnimatedLogo';

export default function CustomerLogin() {
  const { loginCustomer, registerCustomer, type } = useAuth();
  const { lang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (type === 'customer') return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Invalid Gmail / email');
    if (!isValidPhone(phone)) return setError('Invalid phone');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginCustomer({ email, phone: formatPhone(phone), preferred_language: lang });
      } else {
        if (!fullName.trim() || !address.trim()) {
          setLoading(false);
          return setError('Name and address required');
        }
        await registerCustomer({
          email,
          phone: formatPhone(phone),
          full_name: fullName.trim(),
          area: area.trim() || undefined,
          address: address.trim(),
          preferred_language: lang,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <AnimatedLogo size="md" animate />
            </div>
            <p className="label-luxury mb-2">
              {mode === 'login' ? t('login.title', lang) : t('login.register_title', lang)}
            </p>
            <p className="text-white/40 text-sm">{t('login.subtitle', lang)}</p>
            <div className="divider-gold" />
          </div>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs uppercase tracking-wider border ${mode === 'login' ? 'border-accent text-accent' : 'border-white/10 text-white/40'}`}
            >
              {t('login.have_account', lang)}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs uppercase tracking-wider border ${mode === 'register' ? 'border-accent text-accent' : 'border-white/10 text-white/40'}`}
            >
              {t('login.need_account', lang)}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" />{t('login.name', lang)} *
                  </label>
                  <input className="input-field" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />{t('login.area', lang)}
                  </label>
                  <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />{t('login.address', lang)} *
                  </label>
                  <textarea className="input-field min-h-20" required value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3" />{t('login.email', lang)} *
              </label>
              <input className="input-field" type="email" required dir="ltr" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Phone className="w-3 h-3" />{t('login.phone', lang)} *
              </label>
              <input className="input-field" type="tel" required dir="ltr" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
              {loading ? '...' : mode === 'login' ? t('btn.login', lang) : t('btn.register', lang)}
            </button>
          </form>
          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-white/40 hover:text-accent transition-colors uppercase tracking-wider">← Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
