import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../utils/api';
import type { Customer, StaffUser } from '../types';

interface AuthState {
  type: 'customer' | 'staff' | null;
  user: Customer | StaffUser | null;
  loading: boolean;
  loginCustomer: (data: { email: string; phone: string; full_name?: string }) => Promise<void>;
  loginStaff: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<'customer' | 'staff' | null>(null);
  const [user, setUser] = useState<Customer | StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then((res) => {
        setType(res.type);
        setUser(res.user);
      })
      .catch(() => api.setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const loginCustomer = async (data: { email: string; phone: string; full_name?: string }) => {
    const res = await api.customerLogin(data);
    api.setToken(res.session_token);
    setType('customer');
    setUser(res.customer as unknown as Customer);
  };

  const loginStaff = async (data: { email: string; password: string }) => {
    const res = await api.staffLogin(data);
    api.setToken(res.session_token);
    setType('staff');
    setUser(res.user as unknown as StaffUser);
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    api.setToken(null);
    setType(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ type, user, loading, loginCustomer, loginStaff, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
