import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { isValidEmail, isValidPhone, formatPhone } from '../../utils/validators';
import Header from '../Shared/Header';
import AnimatedLogo from '../Shared/AnimatedLogo';

export default function CustomerLogin() {
  const { loginCustomer } = useAuth();
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Invalid email');
    if (!isValidPhone(phone)) return setError('Invalid phone');
    setLoading(true);
    try {
      await loginCustomer({ email, phone: formatPhone(phone), full_name: fullName || undefined });
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <AnimatedLogo size="md" animate />
            </div>
            <p className="label-luxury mb-2">{t('login.title', lang)}</p>
            <div className="divider-gold" />
          </div>
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-3 h-3" />{t('login.name', lang)}
              </label>
              <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3" />{t('login.email', lang)} *
              </label>
              <input className="input-field" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Phone className="w-3 h-3" />{t('login.phone', lang)} *
              </label>
              <input className="input-field" type="tel" required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
              {loading ? '...' : t('btn.login', lang)}
            </button>
            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-white/30 text-xs flex items-center gap-2"><MessageCircle className="w-3 h-3" />{t('login.otp_soon', lang)}</p>
              <p className="text-white/30 text-xs">{t('login.google_soon', lang)}</p>
            </div>
          </form>
          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-white/40 hover:text-accent transition-colors uppercase tracking-wider">← Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
