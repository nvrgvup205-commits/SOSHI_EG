import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍣</div>
          <h1 className="text-2xl font-heading font-bold text-secondary">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">Sushi Shop Egypt</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              <Mail className="inline w-4 h-4 me-1" />Email
            </label>
            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              <Lock className="inline w-4 h-4 me-1" />Password
            </label>
            <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
