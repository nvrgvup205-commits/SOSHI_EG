import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AnimatedLogo from '../Shared/AnimatedLogo';

export default function AdminLogin() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginStaff({ email, password });
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <AnimatedLogo size="md" animate />
          </div>
          <p className="label-luxury mb-2">Administration</p>
          <div className="divider-gold" />
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Mail className="w-3 h-3" />Email
            </label>
            <input type="email" required className="input-field" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" />Password
            </label>
            <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-luxury-filled w-full">
            {loading ? '...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
