import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../utils/api';
import type { Customer, StaffUser } from '../types';

interface AuthState {
  type: 'customer' | 'staff' | null;
  user: Customer | StaffUser | null;
  loading: boolean;
  loginCustomer: (data: {
    email?: string;
    phone?: string;
    identifier?: string;
    password?: string;
    preferred_language?: string;
  }) => Promise<void>;
  registerCustomer: (data: {
    email?: string;
    phone: string;
    full_name: string;
    address: string;
    area?: string;
    password?: string;
    identifier?: string;
    preferred_language?: string;
  }) => Promise<void>;
  loginStaff: (data: { phone?: string; email?: string; identifier?: string; password: string }) => Promise<StaffUser>;
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

  const loginCustomer = async (data: {
    email?: string;
    phone?: string;
    identifier?: string;
    password?: string;
    preferred_language?: string;
  }) => {
    const res = await api.customerLogin(data);
    api.setToken(res.session_token);
    setType('customer');
    setUser(res.customer as unknown as Customer);
  };

  const registerCustomer = async (data: {
    email?: string;
    phone: string;
    full_name: string;
    address: string;
    area?: string;
    password?: string;
    identifier?: string;
    preferred_language?: string;
  }) => {
    const res = await api.customerRegister(data);
    api.setToken(res.session_token);
    setType('customer');
    setUser(res.customer as unknown as Customer);
  };

  const loginStaff = async (data: { phone?: string; email?: string; identifier?: string; password: string }) => {
    const res = await api.staffLogin(data);
    api.setToken(res.session_token);
    setType('staff');
    const staffUser = res.user as unknown as StaffUser;
    setUser(staffUser);
    return staffUser;
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    api.setToken(null);
    setType(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ type, user, loading, loginCustomer, registerCustomer, loginStaff, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
