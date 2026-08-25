import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CustomerLogin from './components/Customer/CustomerLogin';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomersPage from './components/Admin/CustomersPage';
import ProductsPage from './components/Admin/ProductsPage';
import StaffPage from './components/Admin/StaffPage';
import OrdersPage from './components/Admin/OrdersPage';
import SettingsPage from './components/Admin/SettingsPage';
import StaffPortal from './pages/StaffPortal';
import InstallPrompt from './components/Shared/InstallPrompt';
import { isAdminRole, staffDashboardPath } from './utils/staffRoles';
import type { UserRole } from './types';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { type, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (type !== 'staff') return <Navigate to="/admin/login" />;
  const role = (user as { role?: UserRole }).role || 'order_handler';
  if (!isAdminRole(role)) return <Navigate to="/staff" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function StaffLoginRedirect() {
  const { type, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (type === 'staff') {
    const role = (user as { role?: UserRole }).role || 'order_handler';
    return <Navigate to={staffDashboardPath(role)} replace />;
  }
  return <AdminLogin />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin/login" element={<StaffLoginRedirect />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/admin/customers" element={<ProtectedAdmin><CustomersPage /></ProtectedAdmin>} />
      <Route path="/admin/products" element={<ProtectedAdmin><ProductsPage /></ProtectedAdmin>} />
      <Route path="/admin/orders" element={<ProtectedAdmin><OrdersPage /></ProtectedAdmin>} />
      <Route path="/admin/staff" element={<ProtectedAdmin><StaffPage /></ProtectedAdmin>} />
      <Route path="/admin/settings" element={<ProtectedAdmin><SettingsPage /></ProtectedAdmin>} />
      <Route path="/staff" element={<StaffPortal />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </LanguageProvider>
  );
}
