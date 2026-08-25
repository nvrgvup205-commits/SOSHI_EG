import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';
import { isValidEmail, isValidPhone, formatPhone } from '../../utils/validators';

export default function CustomerLogin() {
  const { loginCustomer } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
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
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍣</div>
          <h1 className="text-2xl font-heading font-bold text-secondary">{t('login.title', lang)}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('login.subtitle', lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline w-4 h-4 me-1" />
              {t('login.name', lang)}
            </label>
            <input
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('login.name', lang)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 me-1" />
              {t('login.email', lang)} *
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-4 h-4 me-1" />
              {t('login.phone', lang)} *
            </label>
            <input
              type="tel"
              required
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+201xxxxxxxxx"
              dir="ltr"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '...' : t('btn.login', lang)}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MessageCircle className="w-4 h-4" />
            <span>{t('login.otp_soon', lang)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-base">G</span>
            <span>{t('login.google_soon', lang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
